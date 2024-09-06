use std::{
    borrow::BorrowMut,
    marker::PhantomData,
    sync::{atomic::AtomicBool, Arc, Once},
    time::UNIX_EPOCH,
};

use async_trait::async_trait;
use bounded_integer::BoundedU8;
use cardano_chain_sync::{
    cache::LedgerCacheRocksDB, chain_sync_stream, client::ChainSyncClient, data::LedgerTxEvent,
    event_source::ledger_transactions,
};
use cardano_explorer::{CardanoNetwork, Maestro};
use cardano_submit_api::client::LocalTxSubmissionClient;
use chrono::Duration;
use clap::Parser;
use cml_chain::{
    address::{Address, EnterpriseAddress, RewardAddress},
    assets::{AssetName, MultiAsset},
    builders::{
        input_builder::{InputBuilderResult, SingleInputBuilder},
        mint_builder::SingleMintBuilder,
        output_builder::TransactionOutputBuilder,
        redeemer_builder::RedeemerWitnessKey,
        tx_builder::ChangeSelectionAlgo,
        witness_builder::PartialPlutusWitness,
    },
    certs::StakeCredential,
    genesis::network_info::NetworkInfo,
    plutus::{utils::ConstrPlutusDataEncoding, ConstrPlutusData, ExUnits, PlutusData, RedeemerTag},
    transaction::{DatumOption, Transaction, TransactionOutput},
    utils::BigInteger,
    LenEncoding, PolicyId, Value,
};
use cml_core::serialization::Serialize;
use cml_crypto::{
    chain_core::property::FromStr, Bip32PrivateKey, PrivateKey, RawBytesEncoding, TransactionHash,
};
use cml_multi_era::babbage::BabbageTransaction;
use config::AppConfig;
use futures::{stream::select_all, FutureExt, Stream, StreamExt};
use minicbor::bytes::ByteVec;
use spectrum_cardano_lib::{
    constants::BABBAGE_ERA_ID,
    hash::hash_transaction_canonical,
    output::FinalizedTxOut,
    plutus_data::ConstrPlutusDataExtension,
    protocol_params::constant_tx_builder,
    transaction::{OutboundTransaction, TransactionOutputExtension},
    NetworkId, OutputRef, PaymentCredential,
};
use spectrum_offchain::{
    backlog::{persistence::BacklogStoreRocksDB, BacklogConfig, PersistentPriorityBacklog},
    event_sink::{event_handler::EventHandler, process_events},
    rocks::RocksConfig,
    streaming::boxed,
};
use spectrum_offchain::{data::Has, tx_prover::TxProver};
use spectrum_offchain_cardano::{
    collateral::pull_collateral,
    creds::{operator_creds, operator_creds_base_address, OperatorCred},
    prover::operator::OperatorProver,
    tx_submission::{tx_submission_agent_stream, TxSubmissionAgent},
};
use splash_dao_offchain::{
    deployment::{DaoDeployment, ProtocolDeployment},
    entities::offchain::voting_order::VotingOrder,
    handler::DaoHandler,
    protocol_config::{OperatorCreds, ProtocolConfig, ProtocolTokens},
    routines::inflation::{actions::CardanoInflationActions, Behaviour},
    state_projection::StateProjectionRocksDB,
    time::{NetworkTime, NetworkTimeProvider},
    NetworkTimeSource,
};
use tokio::sync::Mutex;
use tracing::info;
use tracing_subscriber::fmt::Subscriber;

mod config;

#[tokio::main]
async fn main() {
    let subscriber = Subscriber::new();
    tracing::subscriber::set_global_default(subscriber).expect("setting tracing default failed");
    let args = AppArgs::parse();
    let raw_config = std::fs::read_to_string(args.config_path).expect("Cannot load configuration file");
    let config: AppConfig = serde_json::from_str(&raw_config).expect("Invalid configuration file");

    let raw_deployment = std::fs::read_to_string(args.deployment_path).expect("Cannot load deployment file");
    let deployment: DaoDeployment = serde_json::from_str(&raw_deployment).expect("Invalid deployment file");

    log4rs::init_file(args.log4rs_path, Default::default()).unwrap();

    info!("Starting DAO Agent ..");

    let rollback_in_progress = Arc::new(AtomicBool::new(false));
    let explorer = Maestro::new(config.maestro_key_path, config.network_id.into())
        .await
        .expect("Maestro instantiation failed");
    let protocol_deployment = ProtocolDeployment::unsafe_pull(deployment.validators, &explorer).await;

    let chain_sync_cache = Arc::new(Mutex::new(LedgerCacheRocksDB::new(config.chain_sync.db_path)));
    let chain_sync = ChainSyncClient::init(
        Arc::clone(&chain_sync_cache),
        config.node.path,
        config.node.magic,
        config.chain_sync.starting_point,
    )
    .await
    .expect("ChainSync initialization failed");

    // n2c clients:
    let mut tx_submission_client =
        LocalTxSubmissionClient::<BABBAGE_ERA_ID, Transaction>::init(config.node.path, config.node.magic)
            .await
            .expect("LocalTxSubmission initialization failed");
    //let (tx_submission_agent, tx_submission_channel) =
    //    TxSubmissionAgent::<BABBAGE_ERA_ID, OutboundTransaction<Transaction>, Transaction>::new(
    //        config.node,
    //        config.tx_submission_buffer_size,
    //    )
    //    .await
    //    .unwrap();

    // prepare upstreams
    // let tx_submission_stream = tx_submission_agent_stream(tx_submission_agent);
    let (signal_tip_reached_snd, mut signal_tip_reached_recv) = tokio::sync::broadcast::channel(1);
    let ledger_stream = Box::pin(ledger_transactions(
        chain_sync_cache,
        chain_sync_stream(chain_sync, signal_tip_reached_snd),
        config.chain_sync.disable_rollbacks_until,
        config.chain_sync.replay_from_point,
        rollback_in_progress,
    ))
    .await
    .map(|ev| match ev {
        LedgerTxEvent::TxApplied { tx, slot } => LedgerTxEvent::TxApplied {
            tx: (hash_transaction_canonical(&tx.body), tx),
            slot,
        },
        LedgerTxEvent::TxUnapplied(tx) => {
            LedgerTxEvent::TxUnapplied((hash_transaction_canonical(&tx.body), tx))
        }
    });

    let node_magic: u8 = config.network_id.into();
    // let (operator_sk, operator_pkh, operator_cred) = operator_creds(config.batcher_private_key);

    // We assume the batcher's private key is associated with a Cardano base address, which also
    // includes a reward address.
    let (_, _, operator_pkh, operator_cred, operator_sk) =
        operator_creds_base_address(config.batcher_private_key, node_magic as u64);

    let reward_address = RewardAddress::new(
        NetworkInfo::preprod().network_id(),
        StakeCredential::new_pub_key(operator_sk.to_public().hash()),
    );

    let collateral = pull_collateral(operator_pkh.clone(), &explorer)
        .await
        .expect("Couldn't retrieve collateral");

    let mut tx_builder = constant_tx_builder();
    let farm_factory_script = PartialPlutusWitness::new(
        cml_chain::builders::witness_builder::PlutusScriptWitness::Ref(protocol_deployment.farm_factory.hash),
        cml_chain::plutus::PlutusData::ConstrPlutusData(ConstrPlutusData::new(0, vec![])),
    );

    let farm_factory_tx_hash =
        TransactionHash::from_hex("36bd6295ae836ad03066712ca22c93d9263c6f18c04c0af62f76457d86d0010a")
            .unwrap();
    let farm_factory_unspent_output = explorer
        .utxo_by_ref(OutputRef::new(farm_factory_tx_hash, 3))
        .await
        .expect("bbbb");
    println!("input: {:?}", farm_factory_unspent_output);
    let farm_factory_out = farm_factory_unspent_output.output.clone();

    let v: Vec<u8> = vec![];
    let empty_bytes = ByteVec::from(v);
    let encoded = minicbor::to_vec(empty_bytes).unwrap();
    println!("CBOR ENCODED \"\": {}", hex::encode(&encoded));
    let farm_id = PlutusData::new_integer(BigInteger::from_str("10007199254740991").unwrap());
    let seed_data = PlutusData::new_bytes(encoded);
    let mut farm_factory_constr_pd = ConstrPlutusData::new(0, vec![farm_id, seed_data]);
    farm_factory_constr_pd.encodings = Some(ConstrPlutusDataEncoding {
        len_encoding: LenEncoding::Indefinite,
        tag_encoding: None,
        alternative_encoding: None,
        fields_encoding: LenEncoding::Indefinite,
        prefer_compact: true,
    });
    let farm_factory_datum = PlutusData::new_constr_plutus_data(farm_factory_constr_pd.clone());

    let farm_factory_input = SingleInputBuilder::new(
        farm_factory_unspent_output.input.clone(),
        farm_factory_unspent_output.output.clone(),
    )
    .payment_key()
    .unwrap();

    let mut fake_input = farm_factory_unspent_output.input.clone();
    let mut fake_tx_id_bytes = fake_input.transaction_id.to_raw_bytes().to_vec();
    fake_tx_id_bytes[0] = 0;
    fake_input.transaction_id = TransactionHash::from_raw_bytes(&fake_tx_id_bytes).unwrap();

    fake_tx_id_bytes[0] = 0;
    let fake_input_builder_result =
        SingleInputBuilder::new(fake_input, farm_factory_unspent_output.output.clone())
            .payment_key()
            .unwrap();

    //tx_builder.add_reference_input(protocol_deployment.clone().farm_factory.reference_utxo);
    //tx_builder.add_reference_input(protocol_deployment.clone().smart_farm.reference_utxo);
    tx_builder.add_input(farm_factory_input).unwrap();
    tx_builder.add_input(fake_input_builder_result).unwrap();

    // MintAuthToken {factory_in_ix: 0}
    let mint_redeemer = PlutusData::ConstrPlutusData(ConstrPlutusData::new(
        0,
        vec![PlutusData::new_integer(BigInteger::from(0))],
    ));

    let mint_farm_auth_token_script = PartialPlutusWitness::new(
        cml_chain::builders::witness_builder::PlutusScriptWitness::Ref(protocol_deployment.smart_farm.hash),
        mint_redeemer,
    );
    const EX_UNITS: ExUnits = ExUnits {
        mem: 500_000,
        steps: 200_000_000,
        encodings: None,
    };

    // Increment farm id for farm_factory output's datum
    let (farm_auth_token_name, farm_factory_out_datum) = {
        let mut cpd = farm_factory_constr_pd.clone();
        let new_farm_id = if let PlutusData::Integer(i) = cpd.take_field(0).unwrap() {
            i.as_u64().unwrap() + 1
        } else {
            panic!("expected bigint for farm id");
        };

        let new_farm_id_pd = PlutusData::new_integer(BigInteger::from(new_farm_id));
        cpd.set_field(0, new_farm_id_pd.clone());
        let encoded_bytes = new_farm_id_pd.to_cbor_bytes(); //minicbor::to_vec(new_farm_id).unwrap();
        (
            AssetName::try_from(encoded_bytes).unwrap(),
            PlutusData::new_constr_plutus_data(cpd),
        )
    };

    let protocol_config = ProtocolConfig {
        deployed_validators: protocol_deployment.clone(),
        tokens: ProtocolTokens::from_minted_tokens(deployment.nfts),
        operator_sk: config.batcher_private_key.into(),
        node_magic: node_magic as u64,
        reward_address,
        collateral: collateral.clone(),
        genesis_time: config.genesis_start_time.into(),
    };

    let OperatorCreds(_, operator_pkh, addr) = protocol_config.select::<OperatorCreds>();
    let mint_farm_auth_token = SingleMintBuilder::new_single_asset(farm_auth_token_name.clone(), 1)
        .plutus_script(mint_farm_auth_token_script, vec![operator_pkh]);
    tx_builder.add_mint(mint_farm_auth_token).unwrap();

    // farm_factory out
    tx_builder
        .add_output(
            TransactionOutputBuilder::new()
                .with_address(farm_factory_unspent_output.output.address().clone())
                .with_data(DatumOption::new_datum(farm_factory_out_datum))
                .next()
                .unwrap()
                .with_value(Value::new(10_000_000, MultiAsset::new()))
                .build()
                .unwrap(),
        )
        .unwrap();

    // smart_farm_out
    let smart_farm_amount = {
        let mut input_multiasset = MultiAsset::new();
        input_multiasset.set(protocol_deployment.smart_farm.hash, farm_auth_token_name, 1);
        Value::new(11_000_000, input_multiasset)
    };

    let smart_farm_cred = StakeCredential::new_script(protocol_deployment.smart_farm.hash);
    let smart_farm_addr = Address::Enterprise(EnterpriseAddress::new(0, smart_farm_cred));

    tx_builder
        .add_output(
            TransactionOutputBuilder::new()
                .with_address(smart_farm_addr)
                .with_data(DatumOption::new_datum(PlutusData::new_bytes(
                    vec![], //deployment.nfts.perm_auth.policy_id.to_raw_bytes().to_vec(),
                )))
                .next()
                .unwrap()
                .with_value(smart_farm_amount)
                .build()
                .unwrap(),
        )
        .unwrap();

    //tx_builder.set_exunits(RedeemerWitnessKey::new(RedeemerTag::Spend, 0), EX_UNITS);
    tx_builder.set_exunits(RedeemerWitnessKey::new(RedeemerTag::Mint, 0), EX_UNITS);

    tx_builder
        .add_collateral(InputBuilderResult::from(collateral))
        .unwrap();

    let signed_tx_builder = tx_builder.build(ChangeSelectionAlgo::Default, &addr).unwrap();

    let prover = OperatorProver::new(&operator_sk);
    let tx = prover.prove(signed_tx_builder);

    tx_submission_client.submit_tx((*tx).clone()).await.unwrap();

    // let (ledger_event_snd, ledger_event_rcv) = tokio::sync::mpsc::channel(100);

    //let inflation_actions = CardanoInflationActions::from(protocol_config.clone());

    //let mut behaviour = Behaviour::new(
    //    StateProjectionRocksDB::new(config.inflation_box_persistence_config),
    //    StateProjectionRocksDB::new(config.poll_factory_persistence_config),
    //    StateProjectionRocksDB::new(config.weighting_poll_persistence_config),
    //    StateProjectionRocksDB::new(config.voting_escrow_persistence_config),
    //    StateProjectionRocksDB::new(config.smart_farm_persistence_config),
    //    StateProjectionRocksDB::new(config.perm_manager_persistence_config),
    //    StateProjectionRocksDB::new(config.funding_box_config),
    //    setup_order_backlog(config.order_backlog_config).await,
    //    NetworkTimeSource {},
    //    inflation_actions,
    //    protocol_config,
    //    PhantomData::<TransactionOutput>,
    //    tx_submission_channel,
    //    operator_sk,
    //    ledger_event_rcv,
    //    signal_tip_reached_recv,
    //);

    //let handlers: Vec<Box<dyn EventHandler<LedgerTxEvent<ProcessingTransaction>>>> =
    //    vec![Box::new(DaoHandler::new(ledger_event_snd))];
    //let process_ledger_events_stream = process_events(ledger_stream, handlers);

    //let mut app = select_all(vec![
    //    boxed(process_ledger_events_stream),
    //    boxed(behaviour.as_stream()),
    //    boxed(tx_submission_stream),
    //]);
    //loop {
    //    app.select_next_some().await;
    //}
}

async fn setup_order_backlog(
    store_conf: RocksConfig,
) -> PersistentPriorityBacklog<VotingOrder, BacklogStoreRocksDB> {
    let store = BacklogStoreRocksDB::new(store_conf);
    let backlog_config = BacklogConfig {
        order_lifespan: Duration::try_hours(1).unwrap(),
        order_exec_time: Duration::try_minutes(5).unwrap(),
        retry_suspended_prob: BoundedU8::new(60).unwrap(),
    };

    PersistentPriorityBacklog::new::<VotingOrder>(store, backlog_config).await
}

#[derive(Parser)]
#[command(name = "splash-dao-agent")]
#[command(author = "Spectrum Labs")]
#[command(version = "1.0.0")]
#[command(about = "Splash DAO Agent", long_about = None)]
struct AppArgs {
    /// Path to the JSON configuration file.
    #[arg(long, short)]
    config_path: String,
    /// Path to the JSON deployment configuration file .
    #[arg(long, short)]
    deployment_path: String,
    /// Path to the log4rs YAML configuration file.
    #[arg(long, short)]
    log4rs_path: String,
}

pub type ProcessingTransaction = (TransactionHash, BabbageTransaction);

//fn receiver_as_stream<T>(rcv: tokio::sync::mpsc::Receiver<T>) -> impl Stream<Item = T> {
//    stream! {
//        loop {
//            match rcv.
//        }
//    }
//}

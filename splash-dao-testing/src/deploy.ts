import fs from "node:fs/promises";
import {
  Blaze,
  Blockfrost,
  Core,
  Data,
  HotWallet,
  Maestro,
  Static,
  Value,
} from "@blaze-cardano/sdk";
import { getBlaze } from "./wallet.ts";
import {
  GovernancePermManagerPermManager,
  GovernanceVeFactoryMintVeCompositionToken,
  TokenDeploymentMintingOnetimeMint,
  TokenSmartFarmSmartFarm,
} from "./../plutus.ts";
import { GovernanceVotingEscrowVotingEscrow } from "../plutus.ts";
import { GovernanceVotingEscrowMintGovernancePower } from "../plutus.ts";
import { GovernanceGovProxyGovProxy } from "../plutus.ts";
import { GovernanceVeFactoryVeFactory } from "../plutus.ts";
import { GovernanceWeightingPollWpFactory } from "../plutus.ts";
import { GovernanceWeightingPollMintWpAuthToken } from "../plutus.ts";
import { TokenSmartFarmMintFarmAuthToken } from "../plutus.ts";
import { TokenSmartFarmFarmFactory } from "../plutus.ts";
import { GovernanceVotingEscrowMintWeightingPower } from "../plutus.ts";
import { TokenInflationInflation } from "../plutus.ts";
import {
  BuiltValidators,
  DaoInput,
  DeployedValidators,
  NFTDetails,
  ScriptNames,
} from "./types.ts";
import { NFTNames } from "./types.ts";
import { TokenIdentifierMintIdentifier } from "../plutus.ts";
// import { Bip32PublicKey, toHex } from "@blaze-cardano/core";

const NFT_JSON_FILENAME = "nfts.json";
const BUILT_VALIDATORS_JSON_FILENAME = "validators.json";
const DEPLOYED_VALIDATORS_JSON_FILENAME = "deployedValidators.json";
const PREPROD_DEPLOYMENT_JSON_FILENAME = "preprod.deployment.json";
const TX_CONFIRMATION_WAIT_TIME = 120000;

const SPLASH_POLICY_ID =
  "3976a4503e5aabc4ada7dc4ba871bda4ca7fe4c670f9a1572ca296d2";
const SPLASH_ASSET_NAME = stringToHex("SPLASH");
const ZEROTH_EPOCH_START = 1725443610000n;
const INFLATION_BOX_INITIAL_SPLASH_QTY = 32000000000000n;
const LQ_NAME = stringToHex("SPLASH/ADA LQ*");
const LQ_POLICY_ID = "082ad267dc5eb4d3a52e1fc830b0e054c2e497ebc02c49982bfc9734";

async function main() {
  // console.log(toHex(cbor.encode(new Uint8Array([]))));
  const [blaze, pubKey, kk] = await getBlaze();

  // SPECIFY SETTINGS HERE -------------------------------------------------------------------------

  // To differentiate different deployments for testing
  const acceptedAssets = new Map();
  acceptedAssets.set({
    policy: LQ_POLICY_ID,
    name: LQ_NAME,
  }, { num: 1n, den: 1n });

  const cborWriter = new Core.CborWriter();

  const daoInput: DaoInput = {
    inflation: 0n,
    votingEscrow: {
      lockedUntil: { Def: [1n] },
      owner: { PubKey: [pubKey] },
      maxExFee: 100000n,
      version: 1n,
      lastWpEpoch: 1n,
      lastGpDeadline: 1n,
    },
    farmFactory: {
      lastFarmId: 10007199254740991n,
      farmSeedData: cborWriter.writeByteString(new Uint8Array([]))
        .encodeAsHex(),
    },
    wpFactory: {
      lastPollEpoch: -1n,
      activeFarms: [stringToHex("farm0"), stringToHex("f1")],
    },
    veFactory: {
      acceptedAssets,
      legacyAcceptedAssets: new Map(),
    },
  };

  //------------------------------------------------------------------------------------------------
  await mintNFTs(blaze);

  const nftDetails = JSON.parse(
    await fs.readFile(NFT_JSON_FILENAME, "utf8"),
  );

  const txs = await deployValidators(blaze);
  const builtValidators = JSON.parse(
    await fs.readFile(BUILT_VALIDATORS_JSON_FILENAME, "utf8"),
  );

  await getDeployedValidators(
    blaze,
    builtValidators,
    txs,
  );
  const deployedValidators = JSON.parse(
    await fs.readFile(DEPLOYED_VALIDATORS_JSON_FILENAME, "utf8"),
  );

  const preprodConfig = {
    validators: deployedValidators,
    nfts: nftDetails,
  };
  await fs.writeFile(
    PREPROD_DEPLOYMENT_JSON_FILENAME,
    toJson(preprodConfig),
  );

  await createEntities(blaze, deployedValidators, nftDetails, daoInput);
}

async function createMultipleMintingUtxOs(
  blaze: Blaze<Maestro, HotWallet>,
  addr: Core.Address,
  firstValuePerBox: bigint,
  subsequentValuePerBox: bigint,
) {
  const tx = await blaze.newTransaction()
    .payLovelace(addr, firstValuePerBox)
    .payLovelace(addr, subsequentValuePerBox)
    .payLovelace(addr, subsequentValuePerBox)
    .payLovelace(addr, subsequentValuePerBox)
    .payLovelace(addr, subsequentValuePerBox)
    .payLovelace(addr, subsequentValuePerBox)
    .payLovelace(addr, subsequentValuePerBox)
    .payLovelace(addr, subsequentValuePerBox)
    .payLovelace(addr, subsequentValuePerBox)
    .complete();

  const signedTx = await blaze.signTransaction(tx);

  const txHash = await blaze.submitTransaction(signedTx);
  console.log("Creating UTxOs. tx hash: " + txHash);
  await blaze.provider.awaitTransactionConfirmation(txHash);
  await sleep(TX_CONFIRMATION_WAIT_TIME);
  console.log("created multiple UTxOs.");
  return txHash;
}

async function mintNFTs(
  blaze: Blaze<Maestro, HotWallet>,
) {
  const myAddr = blaze.wallet.address;

  //const multipleUTxOTxId = await createMultipleMintingUtxOs(
  //  blaze,
  //  myAddr,
  //  20000000n,
  //  20000000n,
  //);

  const multipleUTxOTxId =
    "c7eca333595da956163263e9b78c878b57e40a9f45b400c8f175d98b66e54a66";

  const utxos = (await blaze.provider.getUnspentOutputs(myAddr)).filter((
    utxo,
  ) => utxo.input().transactionId() === multipleUTxOTxId);

  const nftDetails = buildNFTDetails(multipleUTxOTxId);
  let txBuilder = blaze.newTransaction().addUnspentOutputs(utxos);

  const keys = Object.keys(nftDetails) as NFTNames[];
  // const key = keys[0];
  keys.pop();
  for (const key of keys) {
  const { script, policyId, assetName, quantity } = nftDetails[key];
  console.log(
    "Policy ID for " + key + ": " + policyId + ", qty: " + quantity,
  );
  const actualScript = Core.Script.fromCbor(script);
  txBuilder = txBuilder
    .addMint(policyId, new Map().set(assetName, quantity), Data.void())
    .provideScript(actualScript);
  console.log("Added mint to TX for " + assetName);
  }

  // Write to JSON
  const filePath = NFT_JSON_FILENAME;

  // Write the object to a JSON file
  await fs.writeFile(filePath, toJson(nftDetails));

  const tx = await txBuilder.complete();
  throw new Error("txBuilder.complete() didn't crash!");
  const signedTx = await blaze.signTransaction(tx);
  const txHash = await blaze.submitTransaction(signedTx);
  console.log("Minting NFTs. tx hash: " + txHash);
  console.log("Waiting for TX to be confirmed");
  await blaze.provider.awaitTransactionConfirmation(txHash);
  await sleep(TX_CONFIRMATION_WAIT_TIME);
  console.log("Minted NFTs.");
}

function buildNFTDetails(
  multipleUTxOTxId: string,
): NFTDetails {
  const toMint: [Core.HexBlob, string][] = [];
  const NUM_NFTS = 7;
  for (let i = 0; i < NUM_NFTS; i++) {
    const script = new TokenDeploymentMintingOnetimeMint(
      {
        transactionId: { hash: multipleUTxOTxId },
        outputIndex: BigInt(i),
      },
      1n,
    );

    toMint.push([script.toCbor(), script.hash()]);
  }

  // gt_policy tokens
  const gtTokenQty = 45000000000000000n;
  const mintGTScript = new TokenDeploymentMintingOnetimeMint({
    transactionId: { hash: multipleUTxOTxId },
    outputIndex: BigInt(NUM_NFTS),
  }, gtTokenQty);
  const gtPolicyId = mintGTScript.hash();

  toMint.push([mintGTScript.toCbor(), gtPolicyId]);

  const toBuiltPolicy = (
    e: [Core.HexBlob, string],
    quantity: bigint,
  ) => {
    return {
      script: e[0],
      policyId: Core.PolicyId(e[1]),
      assetName: "a4",
      quantity,
    };
  };

  return {
    factory_auth: toBuiltPolicy(toMint[0], 1n),
    ve_factory_auth: toBuiltPolicy(toMint[1], 1n),
    perm_auth: toBuiltPolicy(toMint[2], 1n),
    proposal_auth: toBuiltPolicy(toMint[3], 1n),
    edao_msig: toBuiltPolicy(toMint[4], 1n),
    inflation_auth: toBuiltPolicy(toMint[5], 1n),
    wp_factory_auth: toBuiltPolicy(toMint[6], 1n),
    gt: toBuiltPolicy(toMint[7], gtTokenQty),
  };
}

async function deployValidators(
  blaze: Blaze<Maestro, HotWallet>,
): Promise<[string, string, string]> {
  const nftDetails = JSON.parse(await fs.readFile(NFT_JSON_FILENAME, "utf8"));
  const gtPolicy = nftDetails.gt.policyId;
  const veFactoryAuthPolicy = nftDetails.ve_factory_auth.policyId;
  const proposalAuthPolicy = nftDetails.proposal_auth.policyId;
  const permManagerAuthPolicy = nftDetails.perm_auth.policyId;
  const edaoMSig = nftDetails.edao_msig.policyId;
  const inflationAuthPolicy = nftDetails.inflation_auth.policyId;

  const governancePowerScript = new GovernanceVotingEscrowMintGovernancePower(
    proposalAuthPolicy,
    gtPolicy,
  );
  const governancePowerPolicy = governancePowerScript.hash();

  const govProxyScript = new GovernanceGovProxyGovProxy(
    veFactoryAuthPolicy,
    proposalAuthPolicy,
    governancePowerPolicy,
    gtPolicy,
  );
  const govProxyScriptHash = govProxyScript.hash();

  const veCompositionScript = new GovernanceVeFactoryMintVeCompositionToken(
    veFactoryAuthPolicy,
  );
  const veCompositionPolicy = veCompositionScript.hash();

  const votingEscrowScript = new GovernanceVotingEscrowVotingEscrow(
    veFactoryAuthPolicy,
    veCompositionPolicy,
  );

  const veScriptHash = votingEscrowScript.hash();

  const farmFactoryAuthPolicy = nftDetails.factory_auth.policyId;

  // `mint_farm_auth_token` is a multivalidator with `smart_farm`
  const farmAuthScript = new TokenSmartFarmMintFarmAuthToken(
    SPLASH_POLICY_ID,
    farmFactoryAuthPolicy,
  );

  const farmAuthScriptHash = farmAuthScript.hash();

  const farmAuthPolicy = farmAuthScript.hash();

  const wpFactoryAuthPolicy = nftDetails.wp_factory_auth.policyId;
  const wpAuthScript = new GovernanceWeightingPollMintWpAuthToken(
    SPLASH_POLICY_ID,
    farmAuthPolicy,
    wpFactoryAuthPolicy,
    inflationAuthPolicy,
    ZEROTH_EPOCH_START,
  );
  const wpAuthPolicy = wpAuthScript.hash();

  const veIdentifierScript = new TokenIdentifierMintIdentifier();
  const veIdentifierPolicy = veIdentifierScript.hash();

  const veFactoryScript = new GovernanceVeFactoryVeFactory(
    veFactoryAuthPolicy,
    veIdentifierPolicy,
    veCompositionPolicy,
    gtPolicy,
    veScriptHash,
    govProxyScriptHash,
  );
  const veFactoryScriptHash = veFactoryScript.hash();

  const wpFactoryScript = new GovernanceWeightingPollWpFactory(
    wpAuthPolicy,
    govProxyScriptHash,
  );
  const wpFactoryScriptHash = wpFactoryScript.hash();

  const farmFactoryScript = new TokenSmartFarmFarmFactory(
    farmAuthPolicy,
    govProxyScriptHash,
  );

  const farmFactoryScriptHash = farmFactoryScript.hash();

  const weightingPowerScript = new GovernanceVotingEscrowMintWeightingPower(
    ZEROTH_EPOCH_START,
    proposalAuthPolicy,
    gtPolicy,
  );

  const weightingPowerScriptHash = weightingPowerScript.hash();

  const weightingPowerPolicy = weightingPowerScript.hash();

  const inflationScript = new TokenInflationInflation(
    inflationAuthPolicy,
    SPLASH_POLICY_ID,
    wpAuthPolicy,
    weightingPowerPolicy,
    ZEROTH_EPOCH_START,
  );

  const inflationScriptHash = inflationScript.hash();

  const permManagerScript = new GovernancePermManagerPermManager(
    edaoMSig,
    permManagerAuthPolicy,
  );
  const permManagerScriptHash = permManagerScript.hash();

  const builtValidators: BuiltValidators = {
    inflation: {
      script: inflationScript,
      hash: inflationScriptHash,
      cost: {
        mem: 500000n,
        steps: 200000000n,
      },
    },
    votingEscrow: {
      script: votingEscrowScript,
      hash: veScriptHash,
      cost: {
        mem: 500000n,
        steps: 200000000n,
      },
    },
    farmFactory: {
      script: farmFactoryScript,
      hash: farmFactoryScriptHash,
      cost: {
        mem: 500000n,
        steps: 200000000n,
      },
    },
    wpFactory: {
      script: wpFactoryScript,
      hash: wpFactoryScriptHash,
      cost: {
        mem: 500000n,
        steps: 200000000n,
      },
    },
    veFactory: {
      script: veFactoryScript,
      hash: veFactoryScriptHash,
      cost: {
        mem: 500000n,
        steps: 200000000n,
      },
    },
    govProxy: {
      script: govProxyScript,
      hash: govProxyScriptHash,
      cost: {
        mem: 500000n,
        steps: 200000000n,
      },
    },
    permManager: {
      script: permManagerScript,
      hash: permManagerScriptHash,
      cost: {
        mem: 500000n,
        steps: 200000000n,
      },
    },
    mintWPAuthToken: {
      script: wpAuthScript,
      hash: wpAuthPolicy,
      cost: {
        mem: 500000n,
        steps: 200000000n,
      },
    },
    mintVEIdentifierToken: {
      script: veIdentifierScript,
      hash: veIdentifierPolicy,
      cost: {
        mem: 500000n,
        steps: 200000000n,
      },
    },
    mintVECompositionToken: {
      script: veCompositionScript,
      hash: veCompositionPolicy,
      cost: {
        mem: 500000n,
        steps: 200000000n,
      },
    },
    weightingPower: {
      script: weightingPowerScript,
      hash: weightingPowerScriptHash,
      cost: {
        mem: 500000n,
        steps: 200000000n,
      },
    },
    smartFarm: {
      script: farmAuthScript,
      hash: farmAuthScriptHash,
      cost: {
        mem: 500000n,
        steps: 200000000n,
      },
    },
  };

  // Write the object to a JSON file
  await fs.writeFile(
    BUILT_VALIDATORS_JSON_FILENAME,
    toJson(builtValidators),
  );

  //const ns: Core.NativeScript = Core.NativeScript.newTimelockExpiry()  blaze.utils.nativeScriptFromJson({
  //  type: "before",
  //  slot: 0,
  //});
  const lockScript = Core.addressFromBech32(
    "addr_test1wp8v2rexyjaxyppmaezyfz7fkwy059ewpde7l9xr4vhcp9qvrkvl0",
  );

  const MyDatumSchema = Data.Object({
    scriptRef: Data.Bytes(),
  });

  type MyDatum = Static<typeof MyDatumSchema>;
  const MyDatum = MyDatumSchema as unknown as MyDatum;

  const toDatum = (script: Core.Script) => {
    const datum: MyDatum = {
      scriptRef: script.hash(),
    };
    return Data.to(datum, MyDatum);
  };

  const datum: MyDatum = {
    scriptRef: builtValidators.inflation.script.hash(),
  };

  const tx0 = await blaze
    .newTransaction()
    .payAssets(
      lockScript,
      Value.zero(),
      toDatum(builtValidators.inflation.script),
    )
    .payAssets(
      lockScript,
      Value.zero(),
      toDatum(builtValidators.votingEscrow.script),
    )
    .payAssets(
      lockScript,
      Value.zero(),
      toDatum(builtValidators.farmFactory.script),
    )
    .payAssets(
      lockScript,
      Value.zero(),
      toDatum(builtValidators.wpFactory.script),
    )
    .payAssets(
      lockScript,
      Value.zero(),
      toDatum(builtValidators.veFactory.script),
    )
    .complete();
  const signedTx0 = await blaze.signTransaction(tx0);
  const txHash0 = await blaze.submitTransaction(signedTx0);
  console.log("Deploying validators (first batch). tx hash: " + txHash0);
  console.log("Waiting for TX to be confirmed");
  await blaze.provider.awaitTransactionConfirmation(txHash0);
  await sleep(TX_CONFIRMATION_WAIT_TIME);

  const tx1 = await blaze
    .newTransaction()
    .payAssets(
      lockScript,
      Value.zero(),
      toDatum(builtValidators.govProxy.script),
    )
    .payAssets(
      lockScript,
      Value.zero(),
      toDatum(builtValidators.permManager.script),
    )
    .payAssets(
      lockScript,
      Value.zero(),
      toDatum(builtValidators.mintWPAuthToken.script),
    )
    .payAssets(
      lockScript,
      Value.zero(),
      toDatum(builtValidators.mintVEIdentifierToken.script),
    )
    .complete();
  const signedTx1 = await blaze.signTransaction(tx1);
  const txHash1 = await blaze.submitTransaction(signedTx1);
  console.log("Deploying validators (2nd batch). tx hash: " + txHash1);
  console.log("Waiting for TX to be confirmed");
  await blaze.provider.awaitTransactionConfirmation(txHash1);
  await sleep(TX_CONFIRMATION_WAIT_TIME);

  // 3rd batch
  const tx2 = await blaze
    .newTransaction()
    .payAssets(
      lockScript,
      Value.zero(),
      toDatum(builtValidators.mintVECompositionToken.script),
    )
    .payAssets(
      lockScript,
      Value.zero(),
      toDatum(builtValidators.weightingPower.script),
    )
    .payAssets(
      lockScript,
      Value.zero(),
      toDatum(builtValidators.smartFarm.script),
    )
    .complete();
  const signedTx2 = await blaze.signTransaction(tx2);
  const txHash2 = await blaze.submitTransaction(signedTx2);
  console.log("Deploying validators (3rd batch). tx hash: " + txHash2);
  console.log("Waiting for TX to be confirmed");
  await blaze.provider.awaitTransactionConfirmation(txHash2);
  await sleep(TX_CONFIRMATION_WAIT_TIME);

  return [txHash0, txHash1, txHash2];
}

async function createEntities(
  blaze: Blaze<Maestro, HotWallet>,
  dv: DeployedValidators,
  nftDetails: NFTDetails,
  daoInput: DaoInput,
) {
  const permManagerAuthToken = nftDetails.perm_auth.policyId +
    nftDetails.perm_auth.assetName;
  const veFactoryAuthToken = nftDetails.ve_factory_auth.policyId +
    nftDetails.ve_factory_auth.assetName;
  const gtToken = nftDetails.gt.policyId + nftDetails.gt.assetName;
  const farmFactoryAuthToken = nftDetails.factory_auth.policyId +
    nftDetails.factory_auth.assetName;
  const inflationAuthToken = nftDetails.inflation_auth.policyId +
    nftDetails.inflation_auth.assetName;
  const wpFactoryAuthToken = nftDetails.wp_factory_auth.policyId +
    nftDetails.wp_factory_auth.assetName;

  const toAddr = (script: Core.Script) =>
    Core.addressFromValidator(
      Core.NetworkId.Testnet,
      script,
    );

  const qty = 10000000n;

  const splashToken = SPLASH_POLICY_ID + SPLASH_ASSET_NAME;

  const inflationAssets: [string, bigint][] = [
    [inflationAuthToken, 1n],
    [splashToken, INFLATION_BOX_INITIAL_SPLASH_QTY],
  ];

  const inflationTokenMap = new Map();
  inflationTokenMap.set(inflationAuthToken, 1n);
  inflationTokenMap.set(splashToken, INFLATION_BOX_INITIAL_SPLASH_QTY);
  const inflationValue = Value.makeValue(qty);
  inflationValue.setMultiasset(inflationTokenMap);

  const smartFarmFactoryTokenMap = new Map();
  smartFarmFactoryTokenMap.set(farmFactoryAuthToken, 1n);
  const smartFarmFactoryValue = Value.makeValue(5n * qty);
  smartFarmFactoryValue.setMultiasset(smartFarmFactoryTokenMap);

  const wpFactoryTokenMap = new Map();
  wpFactoryTokenMap.set(wpFactoryAuthToken, 1n);
  const wpFactoryValue = Value.makeValue(qty);
  wpFactoryValue.setMultiasset(wpFactoryTokenMap);

  const veFactoryTokenMap = new Map();
  veFactoryTokenMap.set(veFactoryAuthToken, 1n);
  veFactoryTokenMap.set(gtToken, BigInt(nftDetails.gt.quantity));
  const veFactoryValue = Value.makeValue(qty);
  veFactoryValue.setMultiasset(veFactoryTokenMap);

  //{ lovelace: qty, []: 1n },
  const permManagerTokenMap = new Map();
  permManagerTokenMap.set(permManagerAuthToken, 1n);
  const permManagerValue = Value.makeValue(qty);
  permManagerValue.setMultiasset(permManagerTokenMap);

  const tx = await blaze.newTransaction()
    .addReferenceInput(dv.inflation.referenceUtxo)
    .addReferenceInput(dv.farmFactory.referenceUtxo)
    .addReferenceInput(dv.wpFactory.referenceUtxo)
    .addReferenceInput(dv.veFactory.referenceUtxo)
    .addReferenceInput(dv.govProxy.referenceUtxo)
    .addReferenceInput(dv.permManager.referenceUtxo)
    .payAssets(
      toAddr(dv.inflation.script),
      inflationValue,
      Data.to(daoInput.inflation, TokenInflationInflation.epoch),
    )
    .payAssets(
      toAddr(dv.farmFactory.script),
      smartFarmFactoryValue,
      Data.to(daoInput.farmFactory, TokenSmartFarmFarmFactory.state),
    )
    .payAssets(
      toAddr(dv.wpFactory.script),
      wpFactoryValue,
      Data.to(daoInput.wpFactory, GovernanceWeightingPollWpFactory.state),
    )
    .payAssets(
      toAddr(dv.veFactory.script),
      veFactoryValue,
      Data.to(daoInput.veFactory, GovernanceVeFactoryVeFactory.conf),
    )
    .payLovelace(toAddr(dv.govProxy.script), qty)
    .payAssets(
      toAddr(dv.permManager.script),
      permManagerValue,
      Data.void(),
    ).complete();

  const signedTx = await blaze.signTransaction(tx);
  const txHash = await blaze.submitTransaction(signedTx);
  console.log("Creating entities. TX hash: " + txHash);
  console.log("Waiting for TX to be confirmed");
  await blaze.provider.awaitTransactionConfirmation(txHash);
  await sleep(TX_CONFIRMATION_WAIT_TIME);

  console.log("Entities created.");

  // Create smart_farm and farm_factory
  //
  // farm_auth token
  const mintFarmAuthScript = new TokenSmartFarmMintFarmAuthToken(
    SPLASH_POLICY_ID,
    nftDetails.factory_auth.policyId,
  );
  const mintFarmAuthScriptHash = mintFarmAuthScript.hash();

  console.log("mint_farm_auth_script_hash: " + mintFarmAuthScriptHash);

  const newFarmId = daoInput.farmFactory.lastFarmId + 1n;
  console.log("new farm id: " + newFarmId);
  const farmAssetName = new Core.CborWriter().writeBigInteger(newFarmId)
    .encodeAsHex();
  console.log("farm asset name: " + farmAssetName);
  const farmAuthToken = mintFarmAuthScriptHash + farmAssetName;

  const factoryOutDatum = {
    lastFarmId: newFarmId,
    farmSeedData: daoInput.farmFactory.farmSeedData,
  };

  const farmFactoryAddr = toAddr(dv.farmFactory.script);

  console.log(farmFactoryAddr);

  const utxos = (await blaze.provider.getUnspentOutputs(farmFactoryAddr))
    .filter((utxo) => utxo.input().transactionId() === txHash);
  console.log(utxos);

  const mintFarmAuthTokenMap = new Map();
  mintFarmAuthTokenMap.set(farmAuthToken, 1n);

  const step0 = blaze.newTransaction()
    .addReferenceInput(dv.farmFactory.referenceUtxo)
    .addInput(
      utxos[1],
      Data.to("CreateFarm", TokenSmartFarmFarmFactory.action),
    )
    .addMint(
      Core.PolicyId(mintFarmAuthScriptHash),
      mintFarmAuthTokenMap,
      Data.to(
        { MintAuthToken: { factoryInIx: 0n } },
        TokenSmartFarmMintFarmAuthToken.action,
      ),
    );

  const farmFactoryTokenMap = new Map();
  farmFactoryTokenMap.set(farmFactoryAuthToken, 1n);
  const farmFactoryValue = Value.makeValue(5n * qty);

  console.log("added minting to TX");
  const step1 = step0.payAssets(
    toAddr(dv.farmFactory.script),
    farmFactoryValue,
    Data.to(factoryOutDatum, TokenSmartFarmFarmFactory.state),
  );
  console.log("add output to factory ");
  try {
    const farmTx = await step1
      .payAssets(
        toAddr(mintFarmAuthScript), // remember: same validator as smart-farm
        Value.makeValue(qty, [farmAuthToken, 1n]),
        Data.to(
          dv.permManager.hash,
          TokenSmartFarmSmartFarm.permManagerAuthPolicy,
        ),
      ).complete();
    //const farmTx = await farmTx0.complete({ nativeUplc: true });
    // const farmTx = await farmTx0.complete();

    console.log("Trying to sign TX");
    const signedFarmTx = await blaze.signTransaction(farmTx);
    console.log("TX successfully signed");
    const farmTxHash = await blaze.submitTransaction(signedFarmTx);
    console.log("Creating smart_farm and farm_factory. TX hash: " + farmTxHash);
    console.log("Waiting for TX to be confirmed");
    await blaze.provider.awaitTransactionConfirmation(farmTxHash);
    await sleep(TX_CONFIRMATION_WAIT_TIME);

    console.log("smart_farm and farm_factory created.");
  } catch (error) {
    console.log(error);
  }
}

async function getDeployedValidators(
  blaze: Blaze<Maestro, HotWallet>,
  builtValidators: BuiltValidators,
  deployedValidatorsTxId: [string, string, string],
) {
  try {
    const builtValidatorsKeys = Object.keys(builtValidators) as ScriptNames[];
    const left = builtValidatorsKeys.slice(0, 5).map((_, index) => (
      new Core.TransactionInput(
        Core.TransactionId(deployedValidatorsTxId[0]),
        BigInt(index),
      )
    ));
    const mid = builtValidatorsKeys.slice(5, 8).map((
      _,
      index,
    ) => (
      new Core.TransactionInput(
        Core.TransactionId(deployedValidatorsTxId[1]),
        BigInt(index),
      )
    ));
    const right = builtValidatorsKeys.slice(8, builtValidatorsKeys.length).map((
      _,
      index,
    ) => (
      new Core.TransactionInput(
        Core.TransactionId(deployedValidatorsTxId[2]),
        BigInt(index),
      )
    ));

    const utxosByOutRefsRequest = left.concat(mid).concat(right);

    const validatorsUtxos = await blaze.provider.resolveUnspentOutputs(
      utxosByOutRefsRequest,
    );

    const deployedValidators = builtValidatorsKeys.reduce((
      acc,
      key: ScriptNames,
      index,
    ) => {
      const { script, hash, cost } = builtValidators[key];
      const referenceUtxo = validatorsUtxos[index];

      return {
        [key]: {
          script,
          hash,
          referenceUtxo,
          cost,
        },
        ...acc,
      };
    }, {} as DeployedValidators);

    console.log(deployedValidators);

    const filepath = DEPLOYED_VALIDATORS_JSON_FILENAME;
    // Write the object to a JSON file
    await fs.writeFile(
      filepath,
      toJson(deployedValidators),
    );
  } catch (error) {
    console.error("Failed to get deployed validators:", error);
    throw error;
  }
}

// From: https://stackoverflow.com/a/58253280
function toJson(data: any) {
  if (data !== undefined) {
    return JSON.stringify(
      data,
      (_, v) => typeof v === "bigint" ? `${v}#bigint` : v,
    )
      .replace(/"(-?\d+)#bigint"/g, (_, a) => a);
  }
}

// Utility function to generate a new wallet seed
//async function generateSeed() {
//  const lucid = await getLucid();
//  const seedPhrase = lucid.utils.generateSeedPhrase();
//  const fromSeed = walletFromSeed(
//    seedPhrase,
//    {
//      addressType: "Base",
//      accountIndex: 0,
//    },
//  );
//  console.log(seedPhrase);
//  console.log(fromSeed.address);
//}
//
//function computePrivateKeyFromSeedPhrase(seedPhrase: string) {
//  const entropy = mnemonicToEntropy(seedPhrase);
//
//  // Encode the string into a Uint8Array
//  console.log(
//    Bip32PrivateKey.from_bip39_entropy(Core.fromHex(entropy), new Uint8Array())
//      .to_bech32(),
//  );
//  const s = walletFromSeed(seedPhrase, {
//    addressType: "Base",
//    accountIndex: 0,
//  });
//  console.log(s.address);
//}

async function mintTokens(asset_name: string, quantity: bigint) {
  //const lucid = await getLucid();
  //const pubKey = await setupWallet(lucid);
  //const { paymentCredential } = lucid.utils.getAddressDetails(
  //  await lucid.wallet.address(),
  //);

  const [blaze, pubKeyHex, kk] = await getBlaze();
  // const pk = Bip32PublicKey.fromBytes(pubKeyHex)

  const validUntil = Core.Slot(69757647 + 10001);

  const scriptPK = new Core.ScriptPubkey(kk);
  const before = new Core.TimelockExpiry(validUntil);
  const scriptAll = new Core.ScriptAll(
    [
      Core.NativeScript.newScriptPubkey(scriptPK),
      Core.NativeScript.newTimelockExpiry(before),
    ],
  );

  const mintingPolicy = Core.NativeScript.newScriptAll(scriptAll);

  const script = Core.Script.newNativeScript(mintingPolicy);

  //lucid.utils.nativeScriptFromJson(
  //  {
  //    type: "all",
  //    scripts: [
  //      { type: "sig", keyHash: paymentCredential.hash },
  //      {
  //        type: "before",
  //        slot: lucid.utils.unixTimeToSlot(Date.now() + 1000000),
  //      },
  //    ],
  //  },
  //);

  const policyId = Core.PolicyId(mintingPolicy.hash());

  const unit = policyId + asset_name;
  console.log("policy id: " + policyId);

  const tx = await blaze.newTransaction()
    .provideScript(script)
    .addMint(policyId, new Map().set(asset_name, quantity))
    .setValidUntil(validUntil)
    .complete();

  const signedTx = await blaze.signTransaction(tx);

  console.log("Minting test tokens");
  const txHash = await blaze.submitTransaction(signedTx);
  await blaze.provider.awaitTransactionConfirmation(txHash);
  console.log("Mint TX hash: " + txHash);
}

//async function payToAddress(addr: string) {
//  const lucid = await getLucid();
//  const _ = await setupWallet(lucid);
//  const tx = await lucid.newTx().payToAddress(addr, { lovelace: 4810000000n })
//    .complete();
//  const signedTx = await tx.sign().complete();
//
//  console.log("Pay to " + addr);
//  const txHash = await signedTx.submit();
//  console.log("TX hash: " + txHash);
//}

function stringToHex(s: string) {
  const encoder = new TextEncoder();
  const uint8Array = new Uint8Array(Buffer.from(s, "utf8"));
  return Core.toHex(uint8Array);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// generateSeed();
//payToAddress(
//  "addr_test1qr02lf68hu4n4t5wdgfkn0ddql36z8jr060ytc4e0gscy57qc3u5cmx09wr5wkwngx5gvrmjppaatgdqj5c8v3q406sszrxkn6",
//);
main();

//mintTokens(LQ_NAME, INFLATION_BOX_INITIAL_SPLASH_QTY);
//mintTokens(SPLASH_ASSET_NAME, 2n * INFLATION_BOX_INITIAL_SPLASH_QTY);

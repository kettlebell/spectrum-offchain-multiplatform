use std::fmt::{Debug, Display, Formatter};

use cml_multi_era::babbage::BabbageTransactionOutput;

use crate::orders::grid::GridOrder;
use crate::orders::limit::{LimitOrder, LimitOrderBounds};
use bloom_derivation::{MarketTaker, Stable, Tradable};
use bloom_offchain::execution_engine::liquidity_book::core::{Next, TerminalTake, Unit};
use bloom_offchain::execution_engine::liquidity_book::fragment::TakerBehaviour;
use bloom_offchain::execution_engine::liquidity_book::types::{InputAsset, OutputAsset};
use spectrum_offchain::data::Has;
use spectrum_offchain::ledger::TryFromLedger;
use spectrum_offchain_cardano::creds::OperatorCred;
use spectrum_offchain_cardano::deployment::DeployedScriptInfo;
use spectrum_offchain_cardano::deployment::ProtocolValidator::LimitOrderV1;
use spectrum_offchain_cardano::utxo::ConsumedInputs;

pub mod grid;
pub mod limit;

#[derive(Debug, Copy, Clone, Eq, PartialEq, Ord, PartialOrd, MarketTaker, Stable, Tradable)]
pub enum AnyOrder {
    Limit(LimitOrder),
    Grid(GridOrder),
}

impl Display for AnyOrder {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            AnyOrder::Limit(lo) => std::fmt::Display::fmt(&lo, f),
            AnyOrder::Grid(go) => std::fmt::Display::fmt(&go, f),
        }
    }
}

impl TakerBehaviour for AnyOrder {
    fn with_updated_time(self, time: u64) -> Next<Self, Unit> {
        match self {
            AnyOrder::Limit(o) => o.with_updated_time(time).map_succ(AnyOrder::Limit),
            AnyOrder::Grid(o) => o.with_updated_time(time).map_succ(AnyOrder::Grid),
        }
    }

    fn with_applied_trade(
        self,
        removed_input: InputAsset<u64>,
        added_output: OutputAsset<u64>,
    ) -> Next<Self, TerminalTake> {
        match self {
            AnyOrder::Limit(o) => o
                .with_applied_trade(removed_input, added_output)
                .map_succ(AnyOrder::Limit),
            AnyOrder::Grid(o) => o
                .with_applied_trade(removed_input, added_output)
                .map_succ(AnyOrder::Grid),
        }
    }
    fn with_budget_corrected(self, delta: i64) -> (i64, Self) {
        match self {
            AnyOrder::Limit(o) => {
                let (d, s) = o.with_budget_corrected(delta);
                (d, AnyOrder::Limit(s))
            }
            AnyOrder::Grid(o) => {
                let (d, s) = o.with_budget_corrected(delta);
                (d, AnyOrder::Grid(s))
            }
        }
    }
}

impl<C> TryFromLedger<BabbageTransactionOutput, C> for AnyOrder
where
    C: Has<OperatorCred>
        + Has<ConsumedInputs>
        + Has<DeployedScriptInfo<{ LimitOrderV1 as u8 }>>
        + Has<LimitOrderBounds>,
{
    fn try_from_ledger(repr: &BabbageTransactionOutput, ctx: &C) -> Option<Self> {
        LimitOrder::try_from_ledger(repr, ctx).map(AnyOrder::Limit)
    }
}

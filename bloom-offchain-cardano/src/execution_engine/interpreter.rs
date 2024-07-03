use std::fmt::Debug;

use cml_chain::builders::tx_builder::{ChangeSelectionAlgo, SignedTxBuilder, TransactionBuilder};
use either::Either;
use log::trace;
use num_rational::Ratio;
use tailcall::tailcall;

use bloom_offchain::execution_engine::batch_exec::BatchExec;
use bloom_offchain::execution_engine::bundled::Bundled;
use bloom_offchain::execution_engine::liquidity_book::core::{Execution, ExecutionRecipe, Make, Take};
use bloom_offchain::execution_engine::liquidity_book::fragment::{MarketTaker, TakerBehaviour};
use bloom_offchain::execution_engine::liquidity_book::interpreter::RecipeInterpreter;
use spectrum_cardano_lib::collateral::Collateral;
use spectrum_cardano_lib::hash::hash_transaction_canonical;
use spectrum_cardano_lib::output::FinalizedTxOut;
use spectrum_cardano_lib::protocol_params::constant_tx_builder;
use spectrum_cardano_lib::{NetworkId, OutputRef};
use spectrum_offchain::data::{Baked, Has};
use spectrum_offchain_cardano::creds::{OperatorCred, OperatorRewardAddress};
use spectrum_offchain_cardano::deployment::DeployedValidator;
use spectrum_offchain_cardano::deployment::ProtocolValidator::LimitOrderWitnessV1;

use crate::execution_engine::execution_state::ExecutionState;
use crate::execution_engine::instances::{EffectPreview, FinalizedEffect, Magnet};

/// A short-living interpreter.
#[derive(Debug, Copy, Clone)]
pub struct CardanoRecipeInterpreter;

impl<'a, Fr, Pl, Ctx> RecipeInterpreter<Fr, Pl, Ctx, OutputRef, FinalizedTxOut, SignedTxBuilder>
    for CardanoRecipeInterpreter
where
    Fr: MarketTaker + TakerBehaviour + Copy + std::fmt::Debug,
    Pl: Copy + std::fmt::Debug,
    Magnet<Take<Fr, FinalizedTxOut>>: BatchExec<ExecutionState, EffectPreview<Fr>, Ctx>,
    Magnet<Make<Pl, FinalizedTxOut>>: BatchExec<ExecutionState, EffectPreview<Pl>, Ctx>,
    Ctx: Clone
        + Sized
        + Has<Collateral>
        + Has<NetworkId>
        + Has<OperatorRewardAddress>
        + Has<DeployedValidator<{ LimitOrderWitnessV1 as u8 }>>,
{
    fn run(
        &mut self,
        ExecutionRecipe(instructions): ExecutionRecipe<Fr, Pl, FinalizedTxOut>,
        ctx: Ctx,
    ) -> (
        SignedTxBuilder,
        Vec<FinalizedEffect<Either<Baked<Fr, OutputRef>, Baked<Pl, OutputRef>>>>,
    ) {
        let (mut tx_builder, effects, ctx) = execute_recipe(ctx, instructions);
        let execution_fee_address = ctx.select::<OperatorRewardAddress>().into();
        // Build tx, change is execution fee.
        let tx = tx_builder
            .build(ChangeSelectionAlgo::Default, &execution_fee_address)
            .unwrap();
        let tx_body_cloned = tx.body();
        let tx_hash = hash_transaction_canonical(&tx_body_cloned);

        // Map finalized outputs to states of corresponding domain entities.
        let mut finalized_effects = vec![];
        for eff in effects {
            finalized_effects.push(eff.bimap(
                |p| {
                    let output_ix = tx_body_cloned
                        .outputs
                        .iter()
                        .position(|out| out == &p.1)
                        .expect("Tx.outputs must be coherent with effects!");
                    let out_ref = OutputRef::new(tx_hash, output_ix as u64);
                    p.map(|inner| {
                        inner.map_either(|lh| Baked::new(lh, out_ref), |rh| Baked::new(rh, out_ref))
                    })
                    .map_bearer(|out| FinalizedTxOut(out, out_ref))
                },
                |c| {
                    let Bundled(_, FinalizedTxOut(_, consumed_out_ref)) = c;
                    c.map(|fr| {
                        fr.map_either(
                            |fr| Baked::new(fr, consumed_out_ref),
                            |pl| Baked::new(pl, consumed_out_ref),
                        )
                    })
                },
            ))
        }
        trace!("Finished Tx: {}", tx_hash);
        (tx, finalized_effects)
    }
}

#[tailcall]
fn execute_recipe<Fr, Pl, Ctx>(
    ctx: Ctx,
    instructions: Vec<Execution<Fr, Pl, FinalizedTxOut>>,
) -> (TransactionBuilder, Vec<EffectPreview<Either<Fr, Pl>>>, Ctx)
where
    Fr: MarketTaker + TakerBehaviour + Copy,
    Pl: Copy,
    Magnet<Take<Fr, FinalizedTxOut>>: BatchExec<ExecutionState, EffectPreview<Fr>, Ctx>,
    Magnet<Make<Pl, FinalizedTxOut>>: BatchExec<ExecutionState, EffectPreview<Pl>, Ctx>,
    Ctx: Clone
        + Sized
        + Has<Collateral>
        + Has<NetworkId>
        + Has<OperatorRewardAddress>
        + Has<DeployedValidator<{ LimitOrderWitnessV1 as u8 }>>,
{
    let state = ExecutionState::new();
    let (
        ExecutionState {
            tx_blueprint,
            reserved_fee,
        },
        effects,
        ctx,
    ) = execute(ctx, state, Vec::new(), instructions.clone());
    trace!("Going to interpret blueprint: {}", tx_blueprint);
    let mut tx_builder = tx_blueprint.project_onto_builder(constant_tx_builder(), ctx.select::<NetworkId>());
    tx_builder
        .add_collateral(ctx.select::<Collateral>().into())
        .unwrap();

    let estimated_fee = tx_builder.min_fee(true).unwrap();
    let fee_mismatch = reserved_fee as i64 - estimated_fee as i64;
    trace!(
        "Est. fee {}, reserved fee: {}, mismatch {}",
        estimated_fee,
        reserved_fee,
        fee_mismatch
    );
    if fee_mismatch != 0 {
        let fee_rescale_factor = Ratio::new(estimated_fee, reserved_fee);
        let corrected_recipe = balance_fee(fee_mismatch, fee_rescale_factor, instructions);
        execute_recipe(ctx, corrected_recipe)
    } else {
        (tx_builder, effects, ctx)
    }
}

fn balance_fee<Fr, Pl, Bearer>(
    mut fee_mismatch: i64,
    rescale_factor: Ratio<u64>,
    mut instructions: Vec<Execution<Fr, Pl, Bearer>>,
) -> Vec<Execution<Fr, Pl, Bearer>>
where
    Fr: MarketTaker + TakerBehaviour + Copy,
{
    for i in &mut instructions {
        if let Either::Left(take) = i {
            let delta = take.scale_budget(rescale_factor);
            fee_mismatch -= delta;
        }
    }
    for i in &mut instructions {
        if let Either::Left(take) = i {
            if fee_mismatch != 0 {
                let delta = take.correct_budget(fee_mismatch);
                fee_mismatch -= delta;
            } else {
                break;
            }
        }
    }
    instructions
}

#[tailcall]
fn execute<Fr, Pl, Ctx>(
    ctx: Ctx,
    state: ExecutionState,
    mut updates_acc: Vec<EffectPreview<Either<Fr, Pl>>>,
    mut rem: Vec<Execution<Fr, Pl, FinalizedTxOut>>,
) -> (ExecutionState, Vec<EffectPreview<Either<Fr, Pl>>>, Ctx)
where
    Fr: Copy,
    Pl: Copy,
    Magnet<Take<Fr, FinalizedTxOut>>: BatchExec<ExecutionState, EffectPreview<Fr>, Ctx>,
    Magnet<Make<Pl, FinalizedTxOut>>: BatchExec<ExecutionState, EffectPreview<Pl>, Ctx>,
    Ctx: Clone,
{
    if let Some(instruction) = rem.pop() {
        match instruction {
            Either::Left(take) => {
                let (state, result, ctx) = Magnet(take).exec(state, ctx);
                updates_acc.push(result.bimap(|u| u.map(Either::Left), |e| e.map(Either::Left)));
                execute(ctx, state, updates_acc, rem)
            }
            Either::Right(make) => {
                let (state, result, ctx) = Magnet(make).exec(state, ctx);
                updates_acc.push(result.bimap(|u| u.map(Either::Right), |e| e.map(Either::Right)));
                execute(ctx, state, updates_acc, rem)
            }
        }
    } else {
        return (state, updates_acc, ctx);
    }
}

#[cfg(test)]
mod tests {
    use std::cmp::max;
    use std::fmt::{Display, Formatter};

    use either::Either;
    use num_rational::Ratio;

    use bloom_offchain::execution_engine::bundled::Bundled;
    use bloom_offchain::execution_engine::liquidity_book::core::{Next, TerminalTake, Trans, Unit};
    use bloom_offchain::execution_engine::liquidity_book::fragment::{MarketTaker, TakerBehaviour};
    use bloom_offchain::execution_engine::liquidity_book::side::SideM;
    use bloom_offchain::execution_engine::liquidity_book::time::TimeBounds;
    use bloom_offchain::execution_engine::liquidity_book::types::{
        AbsolutePrice, ExCostUnits, FeeAsset, InputAsset, OutputAsset,
    };

    use crate::execution_engine::interpreter::balance_fee;

    #[test]
    fn fee_overuse_balancing() {
        let t0_0 = SimpleOrderPF::new(0, 250000);
        let t0_1 = SimpleOrderPF::new(0, 0);
        let t1_0 = SimpleOrderPF::new(0, 250000);
        let t1_1 = SimpleOrderPF::new(0, 0);
        let instructions = vec![
            Either::Left(Trans::new(Bundled(t0_0, ()), Next::Succ(t0_1))),
            Either::Left(Trans::new(Bundled(t1_0, ()), Next::Succ(t1_1))),
        ];
        let reserved_fee = 500000;
        let estimated_fee = 456325;
        let rescale_factor = Ratio::new(estimated_fee, reserved_fee);
        let fee_mismatch = reserved_fee as i64 - estimated_fee as i64;
        let balanced_instructions = balance_fee::<_, (), _>(fee_mismatch, rescale_factor, instructions);
        assert_eq!(
            balanced_instructions
                .iter()
                .map(|i| match i {
                    Either::Left(f) => f.consumed_budget(),
                    _ => 0,
                })
                .sum::<u64>(),
            estimated_fee
        )
    }

    #[test]
    fn fee_overuse_balancing_single() {
        let t0_0 = SimpleOrderPF::new(0, 2000000);
        let t0_1 = SimpleOrderPF::new(0, 0);
        let instructions = vec![
            Either::Left(Trans::new(Bundled(t0_0, ()), Next::Succ(t0_1))),
        ];
        let reserved_fee = 2000000u64;
        let fee_mismatch = 1658040i64;
        let estimated_fee = reserved_fee - fee_mismatch as u64;
        let rescale_factor = Ratio::new(estimated_fee, reserved_fee);
        let balanced_instructions = balance_fee::<_, (), _>(fee_mismatch, rescale_factor, instructions);
        dbg!(balanced_instructions.clone());
        assert_eq!(
            balanced_instructions
                .iter()
                .map(|i| match i {
                    Either::Left(f) => f.consumed_budget(),
                    _ => 0,
                })
                .sum::<u64>(),
            estimated_fee
        )
    }

    #[test]
    fn fee_underuse_balancing_even() {
        let t0_0 = SimpleOrderPF::new(0, 250000);
        let t0_1 = SimpleOrderPF::new(0, 100000);
        let t1_0 = SimpleOrderPF::new(0, 250000);
        let t1_1 = SimpleOrderPF::new(0, 100000);
        let instructions = vec![
            Either::Left(Trans::new(Bundled(t0_0, ()), Next::Succ(t0_1))),
            Either::Left(Trans::new(Bundled(t1_0, ()), Next::Succ(t1_1))),
        ];
        let reserved_fee = 300000;
        let estimated_fee = 500000;
        let rescale_factor = Ratio::new(estimated_fee, reserved_fee);
        let fee_mismatch = reserved_fee as i64 - estimated_fee as i64;
        let balanced_instructions = balance_fee::<_, (), _>(fee_mismatch, rescale_factor, instructions);
        assert_eq!(
            balanced_instructions
                .iter()
                .map(|i| match i {
                    Either::Left(f) => f.consumed_budget(),
                    _ => 0,
                })
                .sum::<u64>(),
            estimated_fee
        )
    }

    #[test]
    fn fee_underuse_balancing_uneven() {
        let t0_0 = SimpleOrderPF::new(0, 250000);
        let t0_1 = SimpleOrderPF::new(0, 50000);
        let t1_0 = SimpleOrderPF::new(0, 250000);
        let t1_1 = SimpleOrderPF::new(0, 100000);
        let instructions = vec![
            Either::Left(Trans::new(Bundled(t0_0, ()), Next::Succ(t0_1))),
            Either::Left(Trans::new(Bundled(t1_0, ()), Next::Succ(t1_1))),
        ];
        let reserved_fee = 350000;
        let estimated_fee = 500000;
        let rescale_factor = Ratio::new(estimated_fee, reserved_fee);
        let fee_mismatch = reserved_fee as i64 - estimated_fee as i64;
        let balanced_instructions = balance_fee::<_, (), _>(fee_mismatch, rescale_factor, instructions);
        assert_eq!(
            balanced_instructions
                .iter()
                .map(|i| match i {
                    Either::Left(f) => f.consumed_budget(),
                    _ => 0,
                })
                .sum::<u64>(),
            estimated_fee
        )
    }

    /// Order that supports partial filling.
    #[derive(Copy, Clone, PartialEq, Eq, Hash, Debug)]
    pub struct SimpleOrderPF {
        pub fee: u64,
        pub ex_budget: u64,
    }

    impl Display for SimpleOrderPF {
        fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
            f.write_str(&*format!("Ord(fee={}, budget={})", self.fee, self.ex_budget))
        }
    }

    impl SimpleOrderPF {
        pub fn new(fee: u64, ex_budget: u64) -> Self {
            Self { fee, ex_budget }
        }
    }

    impl MarketTaker for SimpleOrderPF {
        type U = u64;

        fn side(&self) -> SideM {
            SideM::Ask
        }

        fn input(&self) -> u64 {
            0
        }

        fn output(&self) -> OutputAsset<u64> {
            0
        }

        fn price(&self) -> AbsolutePrice {
            AbsolutePrice::new(1, 1)
        }

        fn marginal_cost_hint(&self) -> ExCostUnits {
            0
        }

        fn time_bounds(&self) -> TimeBounds<u64> {
            TimeBounds::None
        }

        fn operator_fee(&self, input_consumed: InputAsset<u64>) -> FeeAsset<u64> {
            0
        }

        fn min_marginal_output(&self) -> OutputAsset<u64> {
            0
        }

        fn fee(&self) -> FeeAsset<u64> {
            self.fee
        }

        fn budget(&self) -> FeeAsset<u64> {
            self.ex_budget
        }
    }

    impl TakerBehaviour for SimpleOrderPF {
        fn with_updated_time(self, time: u64) -> Next<Self, Unit> {
            Next::Succ(self)
        }

        fn with_applied_trade(
            mut self,
            removed_input: InputAsset<u64>,
            added_output: OutputAsset<u64>,
        ) -> Next<Self, TerminalTake> {
            Next::Succ(self)
        }

        fn with_budget_corrected(mut self, delta: i64) -> (i64, Self) {
            let budget_remainder = self.ex_budget as i64;
            let corrected_remainder = budget_remainder + delta;
            let updated_budget_remainder = max(corrected_remainder, 0);
            let real_delta = updated_budget_remainder - budget_remainder;
            self.ex_budget = updated_budget_remainder as u64;
            (real_delta, self)
        }
    }
}

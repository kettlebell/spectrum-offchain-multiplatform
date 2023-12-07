use spectrum_offchain_cardano::data::PoolId;

use crate::execution_engine::liquidity_book::side::Side;
use crate::execution_engine::liquidity_book::types::Price;

/// Pooled liquidity.
pub trait Pool {
    /// Stable identifier of the pool.
    fn id(&self) -> PoolId;
    /// Static price (regardless swap vol) in this pool.
    fn static_price(&self) -> Price;
    /// Real price of swap.
    fn real_price(&self, input: Side<u64>) -> Price;
    /// Output of a swap.
    fn swap(self, input: Side<u64>) -> (u64, Self);
    /// Quality of the pool.
    fn quality(&self) -> PoolQuality;
}

#[derive(Debug, Copy, Clone, Ord, PartialOrd, Eq, PartialEq)]
pub struct PoolQuality(/*price hint*/ pub Price, /*liquidity*/ pub u64);

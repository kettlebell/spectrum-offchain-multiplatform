use cml_chain::Coin;

pub const FEE_DEN: u64 = 100000;

// constants for 20/80 balance pool
pub const ADA_WEIGHT: u64 = 1;
pub const TOKEN_WEIGHT: u64 = 4;

pub const LEGACY_FEE_NUM_MULTIPLIER: u64 = 100;

pub const WEIGHT_FEE_DEN: u64 = 5;

pub const ADDITIONAL_ROUND_PRECISION: usize = 10;

pub const MAX_LQ_CAP: u64 = 0x7fffffffffffffff;

pub const CLASSIC_CFMM_ASSET_WEIGHT: u64 = 5;

pub const MIN_SAFE_ADA_VALUE: Coin = 1000000;

pub const MIN_SAFE_COLLATERAL: Coin = 5000000;

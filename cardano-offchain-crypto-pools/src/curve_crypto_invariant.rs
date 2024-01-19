use primitive_types::U512;

/// The main CurveCrypto equation is:
/// `k * d^(n - 1) * Sum(reserves) + Prod(reserves) = k * d^n + (d / n)^n`,
/// \
/// \
/// Coefficient `k` is:
/// \
/// \
/// `k = a * k0 * gamma ^ 2 / (gamma + 1 - k0)^2`,
/// \
/// \
/// where
/// \
/// \
/// `k0 = Prod(reserves) * n^n / d^n`.
/// \
/// \
/// Variables involved are:
///
/// * `a` - Amplification coefficient;
/// * `d` - Invariant value;
/// * `n` - Number of tradable assets;
/// * `gamma` - Distance coefficient;
/// * `reserves = vec![asset_{i}_balance; n]`.
/// \
/// \

/// Calculates CurveCrypto invariant error.
/// Since we are working with integers the left side of the expression is not equal to the right in most cases.
/// "Invariant error" is the absolute difference between the left and right sides of the expression above.
///
/// # Arguments
/// * `n` - Number of tradable assets;
/// * `nn` - `n^n`;
/// * `total_prod_calc` - Production of pool reserves balances;
/// * `total_sum_calc` - Sum of pool reserves balances;
/// * `a` - Amplification coefficient of the CurveCrypto invariant;
/// * `d` - Value of the CurveCrypto invariant;
/// * `gamma_num` - Distance coefficient numerator;
/// * `gamma_denom` - Distance coefficient denominator.
///
/// # Outputs
/// * `inv_abs_err` - "Invariant error".
pub fn calculate_crypto_invariant_error_from_totals(
    n: &u32,
    nn: &U512,
    total_prod_calc: &U512,
    total_sum_calc: &U512,
    a: &U512,
    d: &U512,
    gamma_num: &U512,
    gamma_denom: &U512,
) -> U512 {
    let dn = vec![*d; usize::try_from(*n).unwrap()]
        .iter()
        .copied()
        .reduce(|x, y| x * y)
        .unwrap();
    // k0 = 1 for stablecoins
    let k0 = *total_prod_calc * *nn / dn;

    let k = *a * k0 * *gamma_num * *gamma_num
        / ((*gamma_num + *gamma_denom - k0 * *gamma_denom) * (*gamma_num + *gamma_denom - k0 * *gamma_denom));
    let inv_left = k * dn / d * *total_sum_calc + *total_prod_calc;
    let inv_right = k * dn + dn / nn;

    if inv_right > inv_left {
        inv_right - inv_left
    } else {
        inv_left - inv_right
    }
}

/// Calculates CurveCrypto invariant error from pure reserves balances with common precision.
///
/// # Arguments
/// * `n` - Number of tradable assets;
/// * `a` - Amplification coefficient of the CurveCrypto invariant;
/// * `gamma_num` - Distance coefficient numerator;
/// * `gamma_denom` - Distance coefficient denominator;
/// * `balances_calc` - Reserves balances with common precision;
/// * `d` - Value of the CurveCrypto invariant.
///
/// # Outputs
/// * `inv_abs_err` - "Invariant error".
pub fn calculate_crypto_invariant_error_from_balances(
    n: &u32,
    a: &U512,
    gamma_num: &U512,
    gamma_denom: &U512,
    balances_calc: &Vec<U512>,
    d: &U512,
) -> U512 {
    // Note: input reserves must be reduced to common precision:
    let nn = U512::from(n.pow(*n));
    let total_prod_calc = balances_calc.iter().copied().reduce(|a, b| a * b).unwrap();
    let total_sum_calc = balances_calc.iter().copied().reduce(|a, b| a + b).unwrap();

    calculate_crypto_invariant_error_from_totals(
        &n,
        &nn,
        &total_prod_calc,
        &total_sum_calc,
        &a,
        &d,
        &gamma_num,
        &gamma_denom,
    )
}

/// Checks if CurveCrypto invariant function is at it's extremum (minimum) point with the given values.
/// \
/// Note: input balances must be reduced to a common denominator (precision).
/// # Arguments
/// * `n` - Number of tradable assets;
/// * `a` - Amplification coefficient of the CurveCrypto invariant;
/// * `gamma_num` - Distance coefficient numerator;
/// * `gamma_denom` - Distance coefficient denominator;
/// * `balances_calc` - Reserves balances with common precision;
/// * `d` - Value of the CurveCrypto invariant.
///
/// # Outputs
///
/// * `is_extremum` - boolean.
pub fn check_crypto_invariant_extremum(
    n: &u32,
    a: &U512,
    gamma_num: &U512,
    gamma_denom: &U512,
    balances_calc: &Vec<U512>,
    d: &U512,
) -> bool {
    let unit = U512::from(1);
    let err_eq =
        calculate_crypto_invariant_error_from_balances(n, a, gamma_num, gamma_denom, balances_calc, d);

    let err_left = calculate_crypto_invariant_error_from_balances(
        n,
        a,
        gamma_num,
        gamma_denom,
        balances_calc,
        &(*d - unit),
    );

    let err_right = calculate_crypto_invariant_error_from_balances(
        n,
        a,
        gamma_num,
        gamma_denom,
        balances_calc,
        &(*d + unit),
    );
    err_left > err_eq && err_right > err_eq
}

/// CurveCrypto invariant value numerical calculation procedure.
/// \
/// Note: input reserves balances must be reduced to a common denominator (precision).
/// \
/// Function solves CurveCrypto invariant equation numerically (relative to `d` while all other parameters are known).
///
/// # Arguments
/// * `reserves` - Tradable reserves balances;
/// * `n_assets` - Number of tradable assets;
/// * `a` - Amplification coefficient of the CurveCrypto invariant;
/// * `gamma_num` - Distance coefficient numerator;
/// * `gamma_denom` - Distance coefficient denominator.
///
/// # Outputs
/// * `d` - value of the CurveCrypto invariant.

pub fn calculate_crypto_invariant(
    reserves: &Vec<U512>,
    n_assets: &u32,
    a: &U512,
    gamma_num: &U512,
    gamma_denom: &U512,
) -> U512 {
    assert_eq!(*n_assets, reserves.len() as u32);
    // Constants commonly used in calculations:
    let unit = U512::from(1);
    let n = U512::from(*n_assets);
    let nn = U512::from(n_assets.pow(*n_assets));

    // Invariant calculation with the Newton-Raphson method:
    let s = reserves.iter().copied().reduce(|x, y| x + y).unwrap();
    let p = reserves.iter().copied().reduce(|x, y| x * y).unwrap();

    let mut d = s.clone();
    let mut abs_d_error = d;
    while abs_d_error > unit {
        let d_previous = d;
        let dn = vec![d; usize::try_from(n).unwrap()]
            .iter()
            .copied()
            .reduce(|x, y| x * y)
            .unwrap();
        // k0 = 1 for stablecoins
        let k0 = p * nn / dn;

        let k = *a * k0 * *gamma_num * *gamma_num
            / ((*gamma_num + *gamma_denom - k0 * *gamma_denom)
                * (*gamma_num + *gamma_denom - k0 * *gamma_denom));
        let inv_left = k * dn / d * s + p;
        let inv_right = k * dn + dn / nn;

        let f_value = inv_left - inv_right;

        let c = dn / (nn / n);
        let g = p * p * (nn / dn) * (nn / dn);
        let e = (*gamma_denom + *gamma_num - g * *gamma_denom) / *gamma_denom;
        let f_derivative_value_denom = d * d;
        let h = (unit + unit) * nn * nn * n * p;
        let f_derivative_value_num = c * d
            + *a * *gamma_num * *gamma_num * nn * p / (*gamma_denom * *gamma_denom * dn)
                * ((h * s - h * d) * p / dn + s * e * dn)
                * e
                * e;
        let f_derivative_value = f_derivative_value_num / f_derivative_value_denom;

        d = d_previous + f_value / f_derivative_value;
        abs_d_error = if d >= d_previous {
            d - d_previous
        } else {
            d_previous - d
        }
    }

    // Fine tuning of the calculated value:
    let mut inv_err =
        calculate_crypto_invariant_error_from_totals(n_assets, &nn, &p, &s, &a, &d, &gamma_num, &gamma_denom);
    let inv_err_upper = calculate_crypto_invariant_error_from_totals(
        n_assets,
        &nn,
        &p,
        &s,
        &a,
        &(d + unit),
        &gamma_num,
        &gamma_denom,
    );
    let inv_err_lower = calculate_crypto_invariant_error_from_totals(
        n_assets,
        &nn,
        &p,
        &s,
        &a,
        &(d - unit),
        &gamma_num,
        &gamma_denom,
    );

    if !((inv_err < inv_err_upper) && (inv_err < inv_err_lower)) {
        let mut inv_err_previous = inv_err + unit;

        while inv_err < inv_err_previous {
            inv_err_previous = inv_err;
            d = d + unit;
            inv_err = calculate_crypto_invariant_error_from_totals(
                n_assets,
                &nn,
                &p,
                &s,
                &a,
                &d,
                &gamma_num,
                &gamma_denom,
            );
        }

        d = d - unit
    }
    d
}

/// Calculates valid exchange between reserves in the CurveCrypto pool.
///\
/// Note: input reserves balances must be reduced to a common denominator (precision).
/// # Arguments
///
/// * `i` - Index of the "base" asset, i.e.index of it's amount in the `reserves_before` vector;
/// * `j` - Index of the "quote" asset, i.e.index of it's amount in the `reserves_before` vector;
/// * `base_amount` - Amount of the "base" asset to be exchanged for the "quote".
/// * `reserves_before` - Tradable reserves balances of the pool before the action;
/// * `n_assets` - Number of tradable assets;
/// * `a` - Amplification coefficient of the CurveCrypto invariant;
/// * `gamma_num` - Distance coefficient numerator;
/// * `gamma_denom` - Distance coefficient denominator.
///
///
/// # Outputs
///
/// * `balance_j` - Balance of the "quote" asset after exchange (in the precision units).
pub fn calculate_crypto_exchange(
    i: &usize,
    j: &usize,
    base_amount: &U512,
    reserves_before: &Vec<U512>,
    n_assets: &u32,
    a: &U512,
    gamma_num: &U512,
    gamma_denom: &U512,
) -> U512 {
    assert_eq!(*n_assets, reserves_before.len() as u32);

    // Constants commonly used in calculations:
    let max_error = U512::from(100);
    let unit = U512::from(1);
    let unit_x2 = U512::from(2);
    let n = U512::from(*n_assets);
    let nn = U512::from(n_assets.pow(*n_assets));

    // Add `base_amount` to the `i`-th reserves balance:
    let mut balances_with_i = reserves_before.clone();
    balances_with_i[*i] = balances_with_i[*i] + *base_amount;

    // ============== Numerical calculation of the "quote" balance after Swap ==============
    let balances_no_j: Vec<U512> = balances_with_i
        .iter()
        .copied()
        .enumerate()
        .filter(|&(k, _)| k != (*j).try_into().unwrap())
        .map(|(_, x)| x)
        .collect();

    let s = balances_no_j.iter().copied().reduce(|a, b| a + b).unwrap();
    let p = balances_no_j
        .iter()
        .copied()
        .reduce(|a, b| if a != U512::from(0) { a * b } else { b })
        .unwrap();

    let balance_j_initial = balances_with_i[*j].clone();

    // Get current invariant value (must be preserved in the calculations below):
    let d = calculate_crypto_invariant(&reserves_before, n_assets, a, gamma_num, gamma_denom);

    //==============INSERT CALCULATIONS HERE==============//
    let dn = vec![d; usize::try_from(n).unwrap()]
        .iter()
        .copied()
        .reduce(|x, y| x * y)
        .unwrap();

    // Result is updated "balance_j" value.
    let mut abs_j_error = d;
    let mut balance_j = dn / (p * nn);
    let mut n_iters = 0;
    let max_iters = 25;
    if balance_j_initial - balance_j < *base_amount {
        while abs_j_error > max_error && n_iters < max_iters {
            n_iters += 1;
            let balance_j_previous = balance_j;

            let s_total = balances_with_i.iter().copied().reduce(|a, b| a + b).unwrap();
            let p_total = balances_with_i
                .iter()
                .copied()
                .reduce(|a, b| if a != U512::from(0) { a * b } else { b })
                .unwrap();

            let k_num = *a * *gamma_num * *gamma_num * p_total * nn;
            let k_denom_l = p_total * nn * *gamma_denom / dn;

            let gamma_n_d_sum = *gamma_num + *gamma_denom;

            let k_denom_unit = if k_denom_l > gamma_n_d_sum {
                k_denom_l - gamma_n_d_sum
            } else {
                gamma_n_d_sum - k_denom_l
            };

            let k_denom = k_denom_unit * k_denom_unit;
            let inv_left = k_num * dn * s_total / (d * k_denom * dn) + p_total;
            let inv_right = k_num * dn / (k_denom * dn) + dn / nn;

            let f_value = if inv_left > inv_right {
                inv_left - inv_right
            } else {
                inv_right - inv_left
            };

            let denom0_l = nn * p * balance_j * *gamma_denom / dn;
            let denom0 = if denom0_l > gamma_n_d_sum {
                denom0_l - gamma_n_d_sum
            } else {
                gamma_n_d_sum - denom0_l
            };
            let denom0x2 = denom0 * denom0;
            let denom0x3 = denom0x2 * denom0;
            let gamma_denom2 = *gamma_denom * *gamma_denom;
            let gamma_denom3 = gamma_denom2 * *gamma_denom;
            let ag2nnp = a * *gamma_num * *gamma_num * nn * p / gamma_denom2;
            let t1 = ag2nnp * s / (d * denom0x2);
            let t2 = ag2nnp / denom0x2;
            let t3 = unit_x2 * ag2nnp * balance_j / (d * denom0x2 * gamma_denom2);
            let t4 = unit_x2 * ag2nnp * balance_j * p * nn / (denom0x3 * dn * d * gamma_denom3);
            let t5 = unit_x2 * ag2nnp * balance_j * p * s * nn / (denom0x3 * gamma_denom3 * dn / dn);
            let t6 = unit_x2 * ag2nnp * balance_j * balance_j * p * nn / (denom0x3 * gamma_denom3 * dn / d);
            let f_derivative_value = if denom0_l > gamma_n_d_sum {
                (p + t3 + t4 + t1) - (t2 + t5 + t6)
            } else {
                (p + t1 + t3 + t5 + t6) - (t2 + t4)
            };

            let step_j = f_value / f_derivative_value;
            balance_j = balance_j_previous - step_j;
            balances_with_i[*j] = balance_j;
            abs_j_error = if balance_j >= balance_j_previous {
                balance_j - balance_j_previous
            } else {
                balance_j_previous - balance_j
            };
            balance_j = balance_j
        }
    }
    // Adjust the calculated final balance of the "quote" asset:
    balances_with_i[*j] = balance_j;
    let mut inv_err = calculate_crypto_invariant_error_from_balances(
        n_assets,
        a,
        gamma_num,
        gamma_denom,
        &balances_with_i,
        &d,
    );
    balances_with_i[*j] = balance_j + unit;
    let inv_err_upper = calculate_crypto_invariant_error_from_balances(
        n_assets,
        a,
        gamma_num,
        gamma_denom,
        &balances_with_i,
        &d,
    );
    balances_with_i[*j] = balance_j - unit;
    let inv_err_lower = calculate_crypto_invariant_error_from_balances(
        n_assets,
        a,
        gamma_num,
        gamma_denom,
        &balances_with_i,
        &d,
    );
    if !((inv_err < inv_err_upper) && (inv_err < inv_err_lower)) {
        let mut inv_err_previous = inv_err + unit;
        while inv_err < inv_err_previous {
            inv_err_previous = inv_err;
            balances_with_i[*j] = balances_with_i[*j] + unit;
            inv_err = calculate_crypto_invariant_error_from_balances(
                n_assets,
                a,
                gamma_num,
                gamma_denom,
                &balances_with_i,
                &d,
            );
        }
        balance_j = balances_with_i[*j] - unit;
    }

    balance_j
}

mod test {
    use primitive_types::U512;
    use rand::seq::SliceRandom;
    use rand::Rng;

    use crate::curve_crypto_invariant::{
        calculate_crypto_exchange, calculate_crypto_invariant,
        calculate_crypto_invariant_error_from_balances, calculate_crypto_invariant_error_from_totals,
        check_crypto_invariant_extremum,
    };

    #[test]
    fn calculate_crypto_invariant_error_from_totals_test() {
        let n_assets_set: Vec<u32> = vec![2, 3, 4];
        let mut rng = rand::thread_rng();
        let mut err_vec = Vec::new();
        for _ in 0..1000 {
            let a: U512 = U512::from(rng.gen_range(1..2000));
            let n = *n_assets_set.choose(&mut rand::thread_rng()).unwrap();
            let nn = U512::from(n.pow(n));
            let balance: u64 = rng.gen();
            let balances_calc = vec![U512::from(balance); n as usize];
            let total_prod_calc = balances_calc.iter().copied().reduce(|a, b| a * b).unwrap();
            let total_sum_calc = balances_calc.iter().copied().reduce(|a, b| a + b).unwrap();
            let d: U512 = U512::from(n) * U512::from(balance);
            let gamma_num = U512::from(rng.gen_range(1..10_000));
            let gamma_denom = U512::from(1_000_000_000u64);

            let err = calculate_crypto_invariant_error_from_totals(
                &n,
                &nn,
                &total_prod_calc,
                &total_sum_calc,
                &a,
                &d,
                &gamma_num,
                &gamma_denom,
            );
            err_vec.push(err);
            assert_eq!(err, U512::from(0));
        }
    }

    #[test]
    fn calculate_crypto_invariant_error_from_balances_test() {
        let n_assets_set: Vec<u32> = vec![2, 3, 4];
        let mut rng = rand::thread_rng();
        for _ in 0..1000 {
            let a: U512 = U512::from(rng.gen_range(1..2000));
            let n = *n_assets_set.choose(&mut rand::thread_rng()).unwrap();
            let balance: u64 = rng.gen();
            let balances_calc = vec![U512::from(balance); n as usize];
            let d: U512 = U512::from(n) * U512::from(balance);
            let gamma_num = U512::from(rng.gen_range(1..10_000));
            let gamma_denom = U512::from(1_000_000_000u64);
            let err = calculate_crypto_invariant_error_from_balances(
                &n,
                &a,
                &gamma_num,
                &gamma_denom,
                &balances_calc,
                &d,
            );
            assert_eq!(err, U512::from(0))
        }
    }

    #[test]
    fn check_crypto_invariant_extremum_test() {
        let n_assets_set: Vec<u32> = vec![2, 3, 4];
        let mut rng = rand::thread_rng();
        for _ in 0..1000 {
            let a = U512::from(rng.gen_range(1..2000) as u64);
            let n = *n_assets_set.choose(&mut rand::thread_rng()).unwrap();
            let balance: u64 = rng.gen();
            let balances_calc = vec![U512::from(balance); n as usize];
            let gamma_num = U512::from(rng.gen_range(1..10_000));
            let gamma_denom = U512::from(1_000_000_000u64);
            let d: U512 = U512::from(n) * U512::from(balance);
            let is_extremum =
                check_crypto_invariant_extremum(&n, &a, &gamma_num, &gamma_denom, &balances_calc, &d);
            assert!(is_extremum)
        }
    }

    #[test]
    fn calculate_crypto_invariant_test() {
        let n_assets_set: Vec<u32> = vec![2, 3, 4];
        let mut rng = rand::thread_rng();
        for _ in 0..1000 {
            let a = U512::from(rng.gen_range(1..2000));
            let n = *n_assets_set.choose(&mut rand::thread_rng()).unwrap();
            let balance: u64 = rng.gen();
            let balances_calc = vec![U512::from(balance); n as usize];
            let gamma_num = U512::from(rng.gen_range(1..10_000));
            let gamma_denom = U512::from(1_000_000_000u64);
            let inv = calculate_crypto_invariant(&balances_calc, &n, &a, &gamma_num, &gamma_denom);

            assert_eq!(inv, U512::from(n) * U512::from(balance))
        }
    }

    #[test]
    fn calculate_crypto_exchange_test() {
        let n_assets_set: Vec<u32> = vec![3, 4];
        let mut rng = rand::thread_rng();
        for _ in 0..1 {
            let a = U512::from(rng.gen_range(1..2000) as u64);
            let n = *n_assets_set.choose(&mut rand::thread_rng()).unwrap();
            let balance: u64 = u64::MAX;
            let balances_calc = vec![U512::from(balance); n as usize];
            let gamma_num = U512::from(rng.gen_range(1..10_000));
            let gamma_denom = U512::from(1_000_000_000u64);

            let idx = rand::seq::index::sample(&mut rng, n as usize, 2).into_vec();
            let i = *idx.get(0).unwrap();
            let j = *idx.get(1).unwrap();

            let base_amount = U512::from(rng.gen_range(100..u32::MAX));

            let quote_amount_final = calculate_crypto_exchange(
                &i,
                &j,
                &base_amount,
                &balances_calc,
                &n,
                &a,
                &gamma_num,
                &gamma_denom,
            );

            assert_eq!(balances_calc[j] - quote_amount_final, base_amount)
        }
    }
}

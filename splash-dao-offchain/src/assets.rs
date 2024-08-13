use cml_chain::PolicyId;
use lazy_static::lazy_static;

use serde::{Deserialize, Serialize};
use spectrum_cardano_lib::{AssetClass, AssetName};

#[derive(Clone, Serialize, Deserialize)]
pub struct Splash;

lazy_static! {
    pub static ref SPLASH_AC: AssetClass = AssetClass::Token((
        PolicyId::from_hex("1fe45dd0068d71ec0b7a9c879328a47ea1fed028712d6effcc8ede0d").unwrap(),
        AssetName::utf8_unsafe("SPLASH".to_string())
    ));
}

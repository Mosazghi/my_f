use chrono::NaiveDate;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct RefrigeratorItemFromMqtt {
    pub barcode: i32,
    // rename from expdate
    #[serde(rename = "expdate")]
    pub expiration_date: String,
}
#[derive(Debug, Deserialize)]
pub struct ApiResponseData {
    pub ean: String,
    pub products: Vec<Product>,
}

#[derive(Debug, Deserialize)]
pub struct ApiResponse {
    pub data: ApiResponseData,
}

#[derive(Debug, Deserialize)]
pub struct Product {
    pub name: Option<String>,
    pub weight: Option<f64>,
    pub weight_unit: Option<String>,
}

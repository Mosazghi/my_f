use chrono::NaiveDate;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct RefrigeratorItemFromMqtt {
    pub barcode: String,
    #[serde(rename = "expDate")]
    pub expiration_date: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Nutrition {
    pub display_name: String,
    pub amount: f32,
    pub unit: String,
}

#[derive(Debug, Deserialize)]
pub struct ApiResponseData {
    pub ean: String,
    pub products: Vec<Product>,
    pub nutrition: Vec<Nutrition>,
}

#[derive(Debug, Deserialize)]
pub struct ApiResponse {
    pub data: ApiResponseData,
}

#[derive(Debug, Deserialize)]
pub struct Product {
    pub name: String,
    pub weight: Option<f32>,
    pub weight_unit: Option<String>,
    #[serde(skip_serializing)]
    pub nutrition: Option<Vec<Nutrition>>,
    pub image: Option<String>,
}

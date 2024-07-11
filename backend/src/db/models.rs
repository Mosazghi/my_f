use chrono::NaiveDate;
use serde::{Deserialize, Serialize};
use sqlx::types::Json;
use sqlx::FromRow;

use crate::mqtt::types::Nutrition;

#[derive(Debug, FromRow, Serialize, Deserialize, Default)]
pub struct RefrigeratorItem {
    pub barcode: String,
    pub name: String,
    pub expiration_date: NaiveDate,
    pub quantity: i32,
    pub nutrition: Json<Vec<Nutrition>>,
    pub created_at: Option<NaiveDate>,
    pub weight: Option<String>,
    pub image_url: Option<String>,
}

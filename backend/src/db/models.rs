use chrono::NaiveDate;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct RefrigeratorItem {
    pub barcode: String,
    pub expiration_date: NaiveDate,
    pub amount: i8,
    pub nutritions: Vec<String>,
    pub weight: f32,
}

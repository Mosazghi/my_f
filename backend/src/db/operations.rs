use super::models::RefrigeratorItem;
use crate::{handlers::TokenData, server::handlers::UpdateRefrigeratorItem, util::parse_date};
use chrono::NaiveDate;
use sqlx::PgPool;

pub async fn insert_token(payload: &TokenData, pool: &PgPool) -> Result<(), sqlx::Error> {
    sqlx::query(
        "INSERT INTO expo_push_token (id, token) VALUES (1, $1)
         ON CONFLICT (id) DO UPDATE SET token = EXCLUDED.token",
    )
    .bind(&payload.token)
    .execute(pool)
    .await;

    Ok(())
}
pub async fn insert_refrigerator_item(
    pool: &PgPool,
    item: &RefrigeratorItem,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        "INSERT INTO refrigerator_items (barcode, name, quantity, expiration_date, nutrition, image_url, weight) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    )
    .bind(&item.barcode)
    .bind(&item.name)
    .bind(&item.quantity)
    .bind(&item.expiration_date)
    .bind(&item.nutrition)
    .bind(&item.image_url)
    .bind(&item.weight)
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn get_refrigerator_items(pool: &PgPool) -> Result<Vec<RefrigeratorItem>, sqlx::Error> {
    let items = sqlx::query_as::<_, RefrigeratorItem>("SELECT * FROM refrigerator_items")
        .fetch_all(pool)
        .await;

    match items {
        Ok(items) => Ok(items),
        Err(e) => Err(e),
    }
}

pub async fn get_refrigerator_item(pool: &PgPool, barcode: &str) -> Option<RefrigeratorItem> {
    let item: Option<RefrigeratorItem> =
        sqlx::query_as("SELECT * FROM refrigerator_items WHERE barcode = $1")
            .bind(barcode)
            .fetch_optional(pool)
            .await
            .unwrap_or(None);

    item
}

pub async fn update_refrigerator_item(
    pool: &PgPool,
    barcode: &str,
    item: &UpdateRefrigeratorItem,
) -> Result<(), sqlx::Error> {
    let mut parsed_date: Option<Option<NaiveDate>> = None; // FIXME: A bit ugly.
    if item.expiration_date.is_some() {
        parsed_date = item.expiration_date.as_ref().map(|date| parse_date(date));

        if parsed_date.unwrap().is_none() {
            return Err(sqlx::Error::RowNotFound);
        }
    }

    sqlx::query("UPDATE refrigerator_items SET name = COALESCE($1, name), quantity = COALESCE($2, quantity), expiration_date = COALESCE($3, expiration_date), weight = COALESCE($4, weight) WHERE barcode = $5")
        .bind(&item.name)
        .bind(&item.quantity)
        .bind(&parsed_date)
        .bind(&item.weight)
        .bind(barcode)
        .execute(pool)
        .await?;

    Ok(())
}

pub async fn delete_refrigerator_item(pool: &PgPool, barcode: &str) -> Result<(), sqlx::Error> {
    sqlx::query("DELETE FROM refrigerator_items WHERE barcode = $1")
        .bind(barcode)
        .execute(pool)
        .await?;
    Ok(())
}

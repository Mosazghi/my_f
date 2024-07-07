use super::models::RefrigeratorItem;
use sqlx::PgPool;

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

pub async fn get_refrigerator_item(pool: &PgPool, barcode: &str) -> Option<RefrigeratorItem> {
    let item: Option<RefrigeratorItem> =
        sqlx::query_as("SELECT * FROM refrigerator_items WHERE barcode = $1")
            .bind(barcode)
            .fetch_optional(pool)
            .await
            .unwrap_or(None);

    item
}

pub async fn update_refrigerator_item_quantity(
    pool: &PgPool,
    barcode: &str,
    quantity: i32,
) -> Result<(), sqlx::Error> {
    sqlx::query("UPDATE refrigerator_items SET quantity = $1 WHERE barcode = $2")
        .bind(quantity)
        .bind(barcode)
        .execute(pool)
        .await?;
    Ok(())
}

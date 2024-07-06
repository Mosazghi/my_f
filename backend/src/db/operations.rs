use super::models::RefrigeratorItem;
use sqlx::PgPool;

pub async fn insert_refrigerator_item(
    pool: &PgPool,
    item: RefrigeratorItem,
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

use super::models::RefrigeratorItem;
use sqlx::PgPool;

pub async fn insert_refrigerator_item(
    pool: &PgPool,
    item: RefrigeratorItem,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        "INSERT INTO refrigerator_items (barcode, expiration_date, amount, nutritions, weight)
        VALUES ($1, $2, $3, $4, $5)",
    )
    .bind(&item.barcode)
    .bind(&item.expiration_date)
    .bind(&item.amount)
    .bind(&item.nutritions)
    .bind(&item.weight)
    .execute(pool)
    .await?;
    Ok(())
}

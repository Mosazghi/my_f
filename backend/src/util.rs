pub fn parse_date(date: &str) -> chrono::NaiveDate {
    chrono::NaiveDate::parse_from_str(date, "%d/%m/%Y").unwrap_or_else(|e| {
        println!("Failed to parse date: {:?}", e);
        chrono::NaiveDate::from_ymd_opt(2024, 1, 1).unwrap()
    })
}

-- Add up migration script here
CREATE TABLE IF NOT EXISTS refrigerator_items (
  barcode TEXT PRIMARY KEY NOT NULL,
  name TEXT,
  quantity INTEGER NOT NULL,
  expiration_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  nutritions TEXT[],
  image_url TEXT
);

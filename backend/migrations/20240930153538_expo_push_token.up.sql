-- Add up migration script here
CREATE TABLE IF NOT EXISTS expo_push_token (
  id SERIAL PRIMARY KEY,
  token TEXT NOT NULL
);



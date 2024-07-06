-- Add up migration script here
ALTER TABLE refrigerator_items
DROP COLUMN nutrition;


ALTER TABLE refrigerator_items
ADD COLUMN nutrition JSON;


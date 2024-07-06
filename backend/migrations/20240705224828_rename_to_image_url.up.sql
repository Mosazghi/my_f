-- Add up migration script here
ALTER TABLE refrigerator_items 
RENAME image TO image_url;

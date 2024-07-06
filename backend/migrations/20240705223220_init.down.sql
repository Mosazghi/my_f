-- Add down migration script here
ALTER TABLE refrigerator_items 
RENAME image_url TO image;

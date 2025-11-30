-- Add dish_name column to post_photos table
-- This allows each photo to be associated with a specific menu item/dish name

ALTER TABLE post_photos 
ADD COLUMN dish_name VARCHAR(255);

-- Add index for dish_name queries
CREATE INDEX idx_post_photos_dish_name ON post_photos(dish_name);

-- Add metadata fields to posts table
-- These fields allow posts to reference specific menu items, dining halls, and meal types

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS menu_items TEXT[],
  ADD COLUMN IF NOT EXISTS dining_hall_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS meal_type VARCHAR(50);

-- Create index for dining hall lookups
CREATE INDEX IF NOT EXISTS idx_posts_dining_hall ON posts(dining_hall_name);

-- Create index for meal type lookups
CREATE INDEX IF NOT EXISTS idx_posts_meal_type ON posts(meal_type);

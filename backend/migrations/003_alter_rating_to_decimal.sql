-- Migration: Change rating from INTEGER to NUMERIC(3,1) to support decimal ratings (e.g., 3.2, 8.1)
-- This allows ratings from 1.0 to 10.0 with one decimal place precision

ALTER TABLE posts 
  ALTER COLUMN rating TYPE NUMERIC(3,1) 
  USING rating::NUMERIC(3,1);

-- Update the check constraint to allow decimals
ALTER TABLE posts 
  DROP CONSTRAINT IF EXISTS posts_rating_check;

ALTER TABLE posts 
  ADD CONSTRAINT posts_rating_check 
  CHECK (rating >= 1.0 AND rating <= 10.0);


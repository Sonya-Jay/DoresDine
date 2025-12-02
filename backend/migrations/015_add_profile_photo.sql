-- Add profile_photo column to users table
-- This stores the S3 URL or storage key for the user's profile picture

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_photo VARCHAR(500);

-- Add index for profile photo queries (optional, but can help with lookups)
CREATE INDEX IF NOT EXISTS idx_users_profile_photo ON users(profile_photo) WHERE profile_photo IS NOT NULL;


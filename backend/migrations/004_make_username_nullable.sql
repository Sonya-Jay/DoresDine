-- Make username nullable since we're using email for authentication
-- This allows registration without requiring a username
ALTER TABLE users ALTER COLUMN username DROP NOT NULL;


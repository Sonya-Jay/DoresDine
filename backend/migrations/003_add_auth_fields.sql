-- Add authentication-related columns to users
-- Using IF NOT EXISTS to make it safe to run multiple times
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_code VARCHAR(20),
  ADD COLUMN IF NOT EXISTS verification_code_expires TIMESTAMPTZ;

-- Index email_verified for quick lookups
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);

-- Add authentication-related columns to users
ALTER TABLE users
  ADD COLUMN first_name VARCHAR(100),
  ADD COLUMN last_name VARCHAR(100),
  ADD COLUMN password_hash VARCHAR(255),
  ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN verification_code VARCHAR(20),
  ADD COLUMN verification_code_expires TIMESTAMPTZ;

-- Index email_verified for quick lookups
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);

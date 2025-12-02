-- Create post_flags table to track individual flags
CREATE TABLE IF NOT EXISTS post_flags (
  id SERIAL PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR(50) NOT NULL CHECK (reason IN ('misleading', 'inappropriate', 'other')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id) -- Prevent duplicate flags from same user
);

-- Add columns to posts table to track flagged status
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS flag_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS flagged_at TIMESTAMP;

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_post_flags_post_id ON post_flags(post_id);
CREATE INDEX IF NOT EXISTS idx_posts_is_flagged ON posts(is_flagged);

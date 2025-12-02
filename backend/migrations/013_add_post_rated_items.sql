-- Add post_rated_items table to support multiple menu items with individual ratings in a single post
-- This allows users to rate multiple dishes (e.g., salad and cookie) separately within the same post

CREATE TABLE IF NOT EXISTS post_rated_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    menu_item_name VARCHAR(200) NOT NULL,
    rating DECIMAL(3,1) CHECK (rating >= 1 AND rating <= 10),
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient post lookups
CREATE INDEX idx_post_rated_items_post_id ON post_rated_items(post_id);

-- Composite index for ordered retrieval
CREATE INDEX idx_post_rated_items_post_order ON post_rated_items(post_id, display_order);

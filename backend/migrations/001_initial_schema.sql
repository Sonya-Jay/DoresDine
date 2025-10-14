-- Initial schema for DoresDine post creation
--
-- Schema Rationale:
-- 1. users: Stores author information. UUID for distributed ID generation.
-- 2. posts: Core entity. Each post belongs to one user (author).
--    - caption is nullable (photos-only posts are valid)
--    - created_at uses timestamptz for UTC storage
-- 3. post_photos: Normalized 1-to-many relationship (0..N photos per post)
--    - display_order allows client-controlled photo sequence
--    - storage_key stores S3 key, CDN URL, or local path (flexible)
--
-- Extension strategy:
-- - likes: CREATE TABLE likes (id uuid, post_id uuid, user_id uuid, created_at timestamptz)
-- - comments: CREATE TABLE comments (id uuid, post_id uuid, author_id uuid, text text, created_at timestamptz)
-- - shares/bookmarks: Similar approach with post_id foreign key
-- All extensions are additive; no changes to existing schema required.

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Posts table
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    caption TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Post photos (normalized many-to-one with posts)
CREATE TABLE post_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    storage_key VARCHAR(500) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_post_photos_post_id ON post_photos(post_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- Composite index for ordered photo retrieval
CREATE INDEX idx_post_photos_post_display ON post_photos(post_id, display_order);

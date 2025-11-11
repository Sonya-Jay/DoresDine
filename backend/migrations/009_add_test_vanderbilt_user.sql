-- Add the test@vanderbilt.edu user that's actually being used for login
-- Password: test123
-- This ensures the logged-in user has friends and activity to see

-- Insert test@vanderbilt.edu user (using same password hash as other test users)
INSERT INTO users (id, username, email, first_name, last_name, password_hash, email_verified) VALUES
  ('10000000-0000-0000-0000-000000000001', 'testuser_vand', 'test@vanderbilt.edu', 'Test', 'User', '$2b$10$rW2qVPqKqU0YrjKTZqPPr.f6EqvQJZz3k8OqkJHQyOvHVZ8yMqVOi', true)
ON CONFLICT (email) DO UPDATE SET
  id = '10000000-0000-0000-0000-000000000001',
  password_hash = '$2b$10$rW2qVPqKqU0YrjKTZqPPr.f6EqvQJZz3k8OqkJHQyOvHVZ8yMqVOi',
  email_verified = true;

-- Create follow relationships for test@vanderbilt.edu user
-- They follow alice, bob, and carol
INSERT INTO follows (follower_id, following_id) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'), -- follows alice
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003'), -- follows bob
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004'), -- follows carol

  -- alice follows test@vanderbilt.edu back
  ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001'),

  -- bob follows test@vanderbilt.edu back
  ('00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- Add some likes from test@vanderbilt.edu on friend posts
INSERT INTO likes (post_id, user_id)
SELECT p.id, '10000000-0000-0000-0000-000000000001'
FROM posts p
WHERE p.author_id IN ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;

-- Seed data for testing friends/follows functionality
-- Creates multiple test users with various follow relationships and posts

-- Insert additional test users (all using simple password: 'password123')
-- Password hash for 'password123' using bcrypt
INSERT INTO users (id, username, email, first_name, last_name, password_hash, email_verified) VALUES
  ('00000000-0000-0000-0000-000000000002', 'alice_chen', 'alice@vanderbilt.edu', 'Alice', 'Chen', '$2b$10$rW2qVPqKqU0YrjKTZqPPr.f6EqvQJZz3k8OqkJHQyOvHVZ8yMqVOi', true),
  ('00000000-0000-0000-0000-000000000003', 'bob_smith', 'bob@vanderbilt.edu', 'Bob', 'Smith', '$2b$10$rW2qVPqKqU0YrjKTZqPPr.f6EqvQJZz3k8OqkJHQyOvHVZ8yMqVOi', true),
  ('00000000-0000-0000-0000-000000000004', 'carol_davis', 'carol@vanderbilt.edu', 'Carol', 'Davis', '$2b$10$rW2qVPqKqU0YrjKTZqPPr.f6EqvQJZz3k8OqkJHQyOvHVZ8yMqVOi', true),
  ('00000000-0000-0000-0000-000000000005', 'david_wilson', 'david@vanderbilt.edu', 'David', 'Wilson', '$2b$10$rW2qVPqKqU0YrjKTZqPPr.f6EqvQJZz3k8OqkJHQyOvHVZ8yMqVOi', true),
  ('00000000-0000-0000-0000-000000000006', 'emma_taylor', 'emma@vanderbilt.edu', 'Emma', 'Taylor', '$2b$10$rW2qVPqKqU0YrjKTZqPPr.f6EqvQJZz3k8OqkJHQyOvHVZ8yMqVOi', true)
ON CONFLICT (id) DO NOTHING;

-- Create follow relationships
-- testuser follows alice, bob, and carol
INSERT INTO follows (follower_id, following_id) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004'),

  -- alice follows testuser and bob
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003'),

  -- bob follows alice and carol
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004'),

  -- carol follows everyone
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003'),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005'),

  -- david follows alice and emma
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000006'),

  -- emma follows david
  ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000005')
ON CONFLICT DO NOTHING;

-- Insert some posts from various users
INSERT INTO posts (author_id, caption, rating, dining_hall_name, meal_type, created_at) VALUES
  ('00000000-0000-0000-0000-000000000002', 'Amazing brunch at Rand! The pancakes were incredible 🥞', 9.5, 'Rand', 'Brunch', NOW() - INTERVAL '2 hours'),
  ('00000000-0000-0000-0000-000000000003', 'Late night study snacks at Commons', 7.0, 'Commons', 'Dinner', NOW() - INTERVAL '5 hours'),
  ('00000000-0000-0000-0000-000000000004', 'Best pasta I''ve had on campus!', 8.5, 'EBI', 'Lunch', NOW() - INTERVAL '1 day'),
  ('00000000-0000-0000-0000-000000000002', 'Trying the new menu items at Rand 👌', 8.0, 'Rand', 'Dinner', NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000003', 'Sunday brunch vibes', 7.5, 'Rand', 'Brunch', NOW() - INTERVAL '3 days'),
  ('00000000-0000-0000-0000-000000000005', 'First time at Zeppos, pretty good!', 8.0, 'Zeppos', 'Lunch', NOW() - INTERVAL '4 days'),
  ('00000000-0000-0000-0000-000000000006', 'Healthy options at Commons 🥗', 7.0, 'Commons', 'Lunch', NOW() - INTERVAL '5 days')
ON CONFLICT DO NOTHING;

-- Add some likes to the posts
INSERT INTO likes (post_id, user_id)
SELECT p.id, '00000000-0000-0000-0000-000000000001'
FROM posts p
WHERE p.author_id IN ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;

-- Add some comments
INSERT INTO comments (post_id, author_id, text)
SELECT p.id, '00000000-0000-0000-0000-000000000001', 'This looks delicious!'
FROM posts p
WHERE p.author_id = '00000000-0000-0000-0000-000000000002'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO comments (post_id, author_id, text)
SELECT p.id, '00000000-0000-0000-0000-000000000002', 'Thanks! You should try it!'
FROM posts p
WHERE p.author_id = '00000000-0000-0000-0000-000000000002'
LIMIT 1
ON CONFLICT DO NOTHING;

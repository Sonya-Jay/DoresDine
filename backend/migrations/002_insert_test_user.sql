-- Create a test user for development
INSERT INTO users (id, username, email) 
VALUES ('00000000-0000-0000-0000-000000000001', 'testuser', 'test@example.com')
ON CONFLICT (id) DO NOTHING;

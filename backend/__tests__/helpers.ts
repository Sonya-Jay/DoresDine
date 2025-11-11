import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { getTestPool } from './setup';
import { signToken } from '../src/middleware/auth';

export interface TestUser {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password_hash: string;
  email_verified: boolean;
}

/**
 * Create a test user in the database
 */
export const createTestUser = async (
  overrides: Partial<TestUser> = {}
): Promise<TestUser> => {
  const pool = getTestPool();
  const id = overrides.id || uuidv4();
  const username = overrides.username || `testuser_${Date.now()}`;
  const email = overrides.email || `test_${Date.now()}@vanderbilt.edu`;
  const first_name = overrides.first_name || 'Test';
  const last_name = overrides.last_name || 'User';
  const password = 'testpassword123';
  const password_hash = overrides.password_hash || await bcrypt.hash(password, 10);
  const email_verified = overrides.email_verified !== undefined ? overrides.email_verified : true;

  await pool.query(
    `INSERT INTO users (id, username, email, first_name, last_name, password_hash, email_verified)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [id, username, email, first_name, last_name, password_hash, email_verified]
  );

  return {
    id,
    username,
    email,
    first_name,
    last_name,
    password_hash,
    email_verified,
  };
};

/**
 * Create a test post in the database
 */
export const createTestPost = async (
  authorId: string,
  overrides: {
    caption?: string;
    rating?: number;
    menu_items?: string[];
    dining_hall_name?: string;
    meal_type?: string;
    photos?: string[];
  } = {}
): Promise<{ id: string; post: any; photos: any[] }> => {
  const pool = getTestPool();
  const id = uuidv4();
  const caption = overrides.caption || 'Test post';
  const rating = overrides.rating || 7.5;
  const menu_items = overrides.menu_items || [];
  const dining_hall_name = overrides.dining_hall_name || 'Test Hall';
  const meal_type = overrides.meal_type || 'Lunch';
  const photos = overrides.photos || [];

  await pool.query(
    `INSERT INTO posts (id, author_id, caption, rating, menu_items, dining_hall_name, meal_type)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [id, authorId, caption, rating, menu_items, dining_hall_name, meal_type]
  );

  const photoRecords = [];
  for (let i = 0; i < photos.length; i++) {
    const photoId = uuidv4();
    await pool.query(
      `INSERT INTO post_photos (id, post_id, storage_key, display_order)
       VALUES ($1, $2, $3, $4)`,
      [photoId, id, photos[i], i]
    );
    photoRecords.push({ id: photoId, storage_key: photos[i], display_order: i });
  }

  return { id, post: { id, author_id: authorId, caption, rating, menu_items, dining_hall_name, meal_type }, photos: photoRecords };
};

/**
 * Create a test like in the database
 */
export const createTestLike = async (
  postId: string,
  userId: string
): Promise<void> => {
  const pool = getTestPool();
  await pool.query(
    `INSERT INTO likes (post_id, user_id) VALUES ($1, $2)
     ON CONFLICT (post_id, user_id) DO NOTHING`,
    [postId, userId]
  );
};

/**
 * Create a test comment in the database
 */
export const createTestComment = async (
  postId: string,
  authorId: string,
  text: string
): Promise<string> => {
  const pool = getTestPool();
  const id = uuidv4();
  await pool.query(
    `INSERT INTO comments (id, post_id, author_id, text) VALUES ($1, $2, $3, $4)`,
    [id, postId, authorId, text]
  );
  return id;
};

/**
 * Create a test follow relationship in the database
 */
export const createTestFollow = async (
  followerId: string,
  followingId: string
): Promise<void> => {
  const pool = getTestPool();
  await pool.query(
    `INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)
     ON CONFLICT (follower_id, following_id) DO NOTHING`,
    [followerId, followingId]
  );
};

/**
 * Get authentication token for a user
 */
export const getAuthToken = (userId: string): string => {
  return signToken(userId);
};

/**
 * Create authentication headers for a user
 */
export const getAuthHeaders = (userId: string): { Authorization: string } => {
  return {
    Authorization: `Bearer ${getAuthToken(userId)}`,
  };
};


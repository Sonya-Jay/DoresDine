import { Pool } from 'pg';
import dotenv from 'dotenv';

// Mock axios-cookiejar-support BEFORE any other imports that might use it
// This prevents ESM import errors in Jest
jest.mock('axios-cookiejar-support', () => ({
  wrapper: (instance: any) => instance,
}));

jest.mock('tough-cookie', () => ({
  CookieJar: jest.fn().mockImplementation(() => ({
    getCookies: jest.fn(() => []),
    setCookie: jest.fn(),
  })),
}));

// Load environment variables from .env file if it exists
// This will load from process.cwd()/.env by default
dotenv.config();

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
// Use test database URL if provided, otherwise use the actual DATABASE_URL
// Tests will clean up after themselves, so it's safe to use the same database
if (!process.env.DATABASE_URL) {
  console.warn('WARNING: DATABASE_URL is not set. Tests may fail.');
  // Try to use a local test database as fallback (may not exist)
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/doresdine_test';
}

// Mock nodemailer to prevent actual email sending in tests
jest.mock('nodemailer', () => {
  return {
    createTransport: jest.fn(() => ({
      sendMail: jest.fn(() => Promise.resolve({ messageId: 'test-message-id' })),
    })),
  };
});

// Mock AWS S3 client to prevent actual S3 uploads in tests
jest.mock('@aws-sdk/client-s3', () => {
  const mockSend = jest.fn(() => Promise.resolve({}));
  return {
    S3Client: jest.fn(() => ({
      send: mockSend,
    })),
    PutObjectCommand: jest.fn((params) => params),
  };
});

// Mock fs module for file operations in tests
jest.mock('fs', () => {
  const actualFs = jest.requireActual('fs');
  return {
    ...actualFs,
    existsSync: jest.fn(() => true),
    mkdirSync: jest.fn(),
    writeFileSync: jest.fn(),
  };
});

// Global test database pool
let testPool: Pool | null = null;

export const getTestPool = (): Pool => {
  if (!testPool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set. Please set it in your environment or .env file.');
    }
    testPool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      // Use SSL only if DATABASE_URL contains amazonaws.com (RDS)
      ssl: connectionString.includes('amazonaws.com') ? { rejectUnauthorized: false } : false,
    });
  }
  return testPool;
};

// Clean up test database
export const cleanupTestDatabase = async (): Promise<void> => {
  const pool = getTestPool();
  
  // Delete all data in reverse order of dependencies
  await pool.query('DELETE FROM comments');
  await pool.query('DELETE FROM likes');
  await pool.query('DELETE FROM post_photos');
  await pool.query('DELETE FROM posts');
  await pool.query('DELETE FROM follows');
  await pool.query('DELETE FROM users');
  // Note: dining_halls table is not cleaned (it's reference data)
};

// Setup test database schema
export const setupTestDatabase = async (): Promise<void> => {
  const pool = getTestPool();
  
  // Enable UUID extension
  await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  
  // Create tables if they don't exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      username VARCHAR(50) UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      password_hash VARCHAR(255),
      email_verified BOOLEAN DEFAULT FALSE,
      verification_code VARCHAR(10),
      verification_code_expires TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      caption TEXT,
      rating NUMERIC(3,1) CHECK (rating >= 1.0 AND rating <= 10.0),
      menu_items TEXT[],
      dining_hall_name VARCHAR(255),
      meal_type VARCHAR(50),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS post_photos (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      storage_key VARCHAR(500) NOT NULL,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS likes (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(post_id, user_id)
    )
  `);
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS comments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS follows (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(follower_id, following_id)
    )
  `);
  
  // Create dining_halls table for search functionality (optional, may not exist in production)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS dining_halls (
      id INTEGER PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      "cbordUnitId" INTEGER NOT NULL
    )
  `);
  
  // Create indexes
  try {
    await pool.query('CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_post_photos_post_id ON post_photos(post_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id)');
  } catch (error) {
    // Indexes might already exist, ignore errors
  }
};

// Teardown test database
export const teardownTestDatabase = async (): Promise<void> => {
  if (testPool) {
    await cleanupTestDatabase();
    await testPool.end();
    testPool = null;
  }
};

// Before all tests - setup database schema
beforeAll(async () => {
  try {
    await setupTestDatabase();
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  }
}, 30000); // 30 second timeout for database setup

// After all tests - cleanup and close connections
afterAll(async () => {
  try {
    await teardownTestDatabase();
  } catch (error) {
    console.error('Error tearing down test database:', error);
  }
}, 10000);

// Before each test - clean data but keep schema
beforeEach(async () => {
  try {
    await cleanupTestDatabase();
  } catch (error) {
    console.error('Error cleaning test database:', error);
  }
});


require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

async function createTestUser() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('amazonaws.com') 
      ? { rejectUnauthorized: false } 
      : false,
  });

  try {
    const email = 'test@vanderbilt.edu';
    const password = 'test123'; // Change this to your desired password
    const password_hash = await bcrypt.hash(password, 10);
    const username = 'test';
    const first_name = 'Test';
    const last_name = 'User';

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      console.log('User already exists. Updating password and verifying email...');
      
      // Update password and verify email
      await pool.query(
        `UPDATE users 
         SET password_hash = $1, 
             email_verified = true,
             verification_code = NULL,
             verification_code_expires = NULL
         WHERE email = $2`,
        [password_hash, email.toLowerCase()]
      );
      
      console.log(`✅ User ${email} updated with password: ${password}`);
      console.log('Email verified. You can now login.');
    } else {
      // Create new user
      await pool.query(
        `INSERT INTO users (id, username, first_name, last_name, email, password_hash, email_verified)
         VALUES ($1, $2, $3, $4, $5, $6, true)`,
        [uuidv4(), username, first_name, last_name, email.toLowerCase(), password_hash]
      );
      
      console.log(`✅ User ${email} created with password: ${password}`);
      console.log('Email verified. You can now login.');
    }
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await pool.end();
  }
}

createTestUser();


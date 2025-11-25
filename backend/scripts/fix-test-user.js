require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

async function fixTestUser() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('amazonaws.com') 
      ? { rejectUnauthorized: false } 
      : false,
  });

  try {
    const email = 'test@vanderbilt.edu';
    const password = 'test123';
    
    console.log('🔍 Checking user...');
    const existingUser = await pool.query(
      'SELECT id, email, email_verified, password_hash FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length === 0) {
      console.log('❌ User not found. Creating new user...');
      const password_hash = await bcrypt.hash(password, 10);
      const username = 'test';
      const first_name = 'Test';
      const last_name = 'User';

      await pool.query(
        `INSERT INTO users (id, username, first_name, last_name, email, password_hash, email_verified)
         VALUES ($1, $2, $3, $4, $5, $6, true)`,
        [uuidv4(), username, first_name, last_name, email.toLowerCase(), password_hash]
      );
      
      console.log(`✅ User ${email} created with password: ${password}`);
    } else {
      const user = existingUser.rows[0];
      console.log('✅ User found:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Verified: ${user.email_verified}`);
      console.log(`   Has password: ${!!user.password_hash}`);
      
      // Test password
      if (user.password_hash) {
        const match = await bcrypt.compare(password, user.password_hash);
        console.log(`   Password '${password}' matches: ${match}`);
        
        if (!match) {
          console.log('⚠️  Password does not match! Resetting password...');
          const newPassword_hash = await bcrypt.hash(password, 10);
          await pool.query(
            `UPDATE users 
             SET password_hash = $1, 
                 email_verified = true,
                 verification_code = NULL,
                 verification_code_expires = NULL
             WHERE email = $2`,
            [newPassword_hash, email.toLowerCase()]
          );
          console.log(`✅ Password reset for ${email}`);
        }
      } else {
        console.log('⚠️  No password hash found! Setting password...');
        const password_hash = await bcrypt.hash(password, 10);
        await pool.query(
          `UPDATE users 
           SET password_hash = $1, 
               email_verified = true,
               verification_code = NULL,
               verification_code_expires = NULL
           WHERE email = $2`,
          [password_hash, email.toLowerCase()]
        );
        console.log(`✅ Password set for ${email}`);
      }
      
      // Ensure email is verified
      if (!user.email_verified) {
        console.log('⚠️  Email not verified! Verifying...');
        await pool.query(
          `UPDATE users 
           SET email_verified = true,
               verification_code = NULL,
               verification_code_expires = NULL
           WHERE email = $1`,
          [email.toLowerCase()]
        );
        console.log(`✅ Email verified for ${email}`);
      }
    }
    
    console.log('');
    console.log('✅ Login credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('');
    console.log('🔗 Test login with:');
    console.log(`   curl -X POST "${process.env.DATABASE_URL ? 'http://Doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com' : 'http://localhost:3000'}/auth/login" \\`);
    console.log(`     -H "Content-Type: application/json" \\`);
    console.log(`     -d '{"email":"${email}","password":"${password}"}'`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

fixTestUser();


require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

async function createAndVerifyTestUser() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('amazonaws.com') 
      ? { rejectUnauthorized: false } 
      : false,
  });

  try {
    const email = 'test@vanderbilt.edu';
    const emailLower = email.toLowerCase().trim();
    const password = 'test123'; // Default password
    const username = emailLower.split('@')[0];
    
    console.log(`🔍 Checking if ${emailLower} exists...\n`);
    
    // Check if user already exists
    const checkResult = await pool.query(
      'SELECT id, email, email_verified FROM users WHERE email = $1',
      [emailLower]
    );

    if (checkResult.rows.length > 0) {
      const user = checkResult.rows[0];
      console.log(`✅ User ${emailLower} already exists:`);
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Verified: ${user.email_verified}`);
      
      if (!user.email_verified) {
        console.log(`\n⚠️  Email is NOT verified. Verifying now...`);
        await pool.query(
          'UPDATE users SET email_verified = true WHERE id = $1',
          [user.id]
        );
        console.log(`✅ Email verified successfully!`);
      } else {
        console.log(`\n✅ Email is already verified.`);
      }
      
      // Update password to ensure it's set
      const passwordHash = await bcrypt.hash(password, 10);
      await pool.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [passwordHash, user.id]
      );
      console.log(`✅ Password updated to: ${password}`);
      
      console.log(`\n💡 You can now log in with:`);
      console.log(`   Email: ${emailLower}`);
      console.log(`   Password: ${password}`);
      return;
    }

    // Create new user
    console.log(`📝 Creating new user: ${emailLower}\n`);
    
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = require('uuid').v4();
    
    const result = await pool.query(
      `INSERT INTO users (id, username, email, password_hash, email_verified, first_name, last_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, email_verified`,
      [userId, username, emailLower, passwordHash, true, 'Test', 'User']
    );

    const user = result.rows[0];
    console.log(`✅ User created successfully!`);
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Verified: ${user.email_verified}`);
    
    console.log(`\n💡 You can now log in with:`);
    console.log(`   Email: ${emailLower}`);
    console.log(`   Password: ${password}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === '23505') {
      console.error('   User already exists (unique constraint violation)');
    }
  } finally {
    await pool.end();
  }
}

createAndVerifyTestUser();


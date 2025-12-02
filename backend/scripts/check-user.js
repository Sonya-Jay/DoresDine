require('dotenv').config();
const { Pool } = require('pg');

async function checkUser() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('amazonaws.com') 
      ? { rejectUnauthorized: false } 
      : false,
  });

  try {
    const email = 'sonya.jayathilake@vanderbilt.edu';
    
    console.log(`🔍 Checking if ${email} is registered...\n`);
    
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, email_verified, created_at FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      console.log(`❌ Email ${email} is NOT registered in the database.`);
      console.log(`✅ You can use this email to test registration!`);
    } else {
      const user = result.rows[0];
      console.log(`✅ Email ${email} IS already registered:`);
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Name: ${user.first_name} ${user.last_name}`);
      console.log(`   - Email Verified: ${user.email_verified}`);
      console.log(`   - Created: ${user.created_at}`);
      console.log(`\n⚠️  You'll need to use a different email or delete this user first.`);
    }
  } catch (error) {
    console.error('❌ Error checking user:', error.message);
  } finally {
    await pool.end();
  }
}

checkUser();


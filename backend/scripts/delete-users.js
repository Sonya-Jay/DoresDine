require('dotenv').config();
const { Pool } = require('pg');

async function deleteUsers() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('amazonaws.com') 
      ? { rejectUnauthorized: false } 
      : false,
  });

  try {
    console.log('🗑️  Deleting users...\n');
    
    // Delete sonya.jayathilake
    const sonyaResult = await pool.query(
      "DELETE FROM users WHERE email LIKE '%sonya.jayathilake%' OR email LIKE '%jayathilake%' RETURNING email, first_name, last_name"
    );
    
    if (sonyaResult.rows.length > 0) {
      console.log('✅ Deleted users matching "sonya.jayathilake":');
      sonyaResult.rows.forEach(user => {
        console.log(`   - ${user.email} (${user.first_name} ${user.last_name})`);
      });
    } else {
      console.log('ℹ️  No users found matching "sonya.jayathilake"');
    }

    // Delete isabelle.t.pham
    const isabelleResult = await pool.query(
      "DELETE FROM users WHERE email LIKE '%isabelle%pham%' OR email LIKE '%isabelle.t.pham%' RETURNING email, first_name, last_name"
    );

    if (isabelleResult.rows.length > 0) {
      console.log('\n✅ Deleted users matching "isabelle.t.pham":');
      isabelleResult.rows.forEach(user => {
        console.log(`   - ${user.email} (${user.first_name} ${user.last_name})`);
      });
    } else {
      console.log('\nℹ️  No users found matching "isabelle.t.pham"');
    }

    console.log('\n✅ Deletion complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

deleteUsers();


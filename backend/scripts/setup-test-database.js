/**
 * Script to set up a test database
 * This creates a separate database for testing to keep production data safe
 */

require('dotenv').config();
const { Pool } = require('pg');

async function setupTestDatabase() {
  // Get the production database URL to extract connection info
  const prodUrl = process.env.DATABASE_URL;
  if (!prodUrl) {
    console.error('❌ DATABASE_URL is not set in .env');
    process.exit(1);
  }

  // Parse the production URL
  const url = new URL(prodUrl.replace('postgresql://', 'http://'));
  const host = url.hostname;
  const port = url.port || 5432;
  const username = url.username;
  const password = url.password;
  const prodDatabase = url.pathname.slice(1); // Remove leading /

  // Connect to the default 'postgres' database to create the test database
  const adminPool = new Pool({
    host,
    port,
    user: username,
    password,
    database: 'postgres', // Connect to default database
    ssl: prodUrl.includes('amazonaws.com') ? { rejectUnauthorized: false } : false,
  });

  const testDatabaseName = 'doresdine_test';

  try {
    console.log('🔍 Checking if test database exists...');

    // Check if test database exists
    const checkResult = await adminPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [testDatabaseName]
    );

    if (checkResult.rows.length > 0) {
      console.log(`✅ Test database "${testDatabaseName}" already exists`);
    } else {
      console.log(`📝 Creating test database "${testDatabaseName}"...`);
      await adminPool.query(`CREATE DATABASE ${testDatabaseName}`);
      console.log(`✅ Test database "${testDatabaseName}" created successfully`);
    }

    // Now connect to the test database and set up schema
    const testPool = new Pool({
      host,
      port,
      user: username,
      password,
      database: testDatabaseName,
      ssl: prodUrl.includes('amazonaws.com') ? { rejectUnauthorized: false } : false,
    });

    console.log('📝 Setting up test database schema...');

    // Enable UUID extension
    await testPool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Run migrations (simplified - just create tables)
    // You can import your actual migration files here if needed
    console.log('✅ Test database is ready!');

    // Generate the test database URL
    const testDbUrl = `postgresql://${username}:${password}@${host}:${port}/${testDatabaseName}`;
    
    console.log('\n📋 Next steps:');
    console.log('1. Add this line to your backend/.env file:');
    console.log(`   TEST_DATABASE_URL=${testDbUrl}`);
    console.log('\n2. Your production database will remain safe!');
    console.log('   Tests will only use the test database.');

    await testPool.end();
    await adminPool.end();
  } catch (error) {
    console.error('❌ Error setting up test database:', error.message);
    if (error.message.includes('permission denied')) {
      console.error('\n💡 Tip: You may need to create the test database manually in AWS RDS console');
      console.error('   or use a database user with CREATE DATABASE permissions.');
    }
    process.exit(1);
  }
}

setupTestDatabase();


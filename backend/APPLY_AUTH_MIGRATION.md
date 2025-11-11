# Apply Authentication Migration to Production Database

## Problem
Registration is failing with "Internal server error" because the database is missing the authentication columns.

## Solution
Run the migration `003_add_auth_fields.sql` on your RDS database.

## Step 1: Connect to Your RDS Database

You can connect using:
1. **psql command line** (if you have PostgreSQL client installed)
2. **AWS RDS Query Editor** (in AWS Console)
3. **pgAdmin** or another database tool

### Option A: Using psql (Command Line)

```bash
psql "postgresql://doresdblogin:vandydoresdine@doresdine-db.c78uu0gy0jpq.us-east-2.rds.amazonaws.com:5432/doresdine"
```

### Option B: Using AWS RDS Query Editor

1. Go to AWS RDS Console
2. Find your database: `doresdine-db`
3. Click "Query Editor" (or "Connectivity & security" → "Query Editor")
4. Enter credentials:
   - Username: `doresdblogin`
   - Password: `vandydoresdine`
   - Database: `doresdine`

## Step 2: Run the Migration

Copy and paste this SQL into your query editor:

```sql
-- Add authentication-related columns to users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_code VARCHAR(20),
  ADD COLUMN IF NOT EXISTS verification_code_expires TIMESTAMPTZ;

-- Index email_verified for quick lookups
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
```

**Note:** I've added `IF NOT EXISTS` to make it safe to run multiple times.

## Step 3: Verify Migration

Run this query to check the columns exist:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('first_name', 'last_name', 'password_hash', 'email_verified', 'verification_code', 'verification_code_expires');
```

You should see all 6 columns listed.

## Step 4: Test Registration

After running the migration, try registering again in the app. It should work!

## Troubleshooting

### Error: "column already exists"
- This means the migration was already run. You can ignore this or use the `IF NOT EXISTS` version above.

### Error: "permission denied"
- Make sure you're using the correct database user credentials
- The user needs ALTER TABLE permissions

### Error: "relation users does not exist"
- The users table doesn't exist. Run `001_initial_schema.sql` first.

## Quick Command (if using psql)

```bash
psql "postgresql://doresdblogin:vandydoresdine@doresdine-db.c78uu0gy0jpq.us-east-2.rds.amazonaws.com:5432/doresdine" -f migrations/003_add_auth_fields.sql
```

Or copy the SQL from the file and paste it into the query editor.


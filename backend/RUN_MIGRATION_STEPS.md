# How to Run Database Migration - Step by Step

## Option 1: AWS RDS Query Editor (Easiest)

### Step 1: Go to AWS RDS Console
1. Open your web browser
2. Go to: https://console.aws.amazon.com/rds/
3. Make sure you're in the **us-east-2 (Ohio)** region (check top right corner)

### Step 2: Find Your Database
1. In the left sidebar, click **"Databases"**
2. Look for your database: `doresdine-db`
3. Click on the database name to open its details page

### Step 3: Open Query Editor
You have a few options:

**Option A: Query Editor (if available)**
- Look for a button/tab called **"Query Editor"** or **"Query"** 
- It might be in the top menu or in a tab

**Option B: Connect to Database**
- Click **"Connectivity & security"** tab
- Look for **"Query Editor"** or **"Connect"** button
- Or look for **"Actions"** → **"Connect"**

**Option C: If Query Editor isn't visible**
- Some RDS instances don't have Query Editor enabled
- Use Option 2 (psql) or Option 3 (AWS CloudShell) below

### Step 4: Enter Credentials
When the query editor opens, enter:
- **Username:** `doresdblogin`
- **Password:** `vandydoresdine`
- **Database:** `doresdine`

### Step 5: Run the Migration SQL
Copy and paste this entire SQL block:

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

6. Click **"Run"** or **"Execute"** button
7. You should see "Success" or "Query executed successfully"

---

## Option 2: Using psql (Command Line)

If you have PostgreSQL client installed on your Mac:

### Step 1: Open Terminal
- Press `Cmd + Space` and type "Terminal"
- Open Terminal app

### Step 2: Run the Migration
Copy and paste this entire command:

```bash
psql "postgresql://doresdblogin:vandydoresdine@doresdine-db.c78uu0gy0jpq.us-east-2.rds.amazonaws.com:5432/doresdine" -c "ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100), ADD COLUMN IF NOT EXISTS last_name VARCHAR(100), ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255), ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false, ADD COLUMN IF NOT EXISTS verification_code VARCHAR(20), ADD COLUMN IF NOT EXISTS verification_code_expires TIMESTAMPTZ; CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);"
```

**Note:** If you get "command not found: psql", you need to install PostgreSQL client first (see below).

### Install psql (if needed)
```bash
brew install postgresql
```

Then try the command again.

---

## Option 3: Using AWS CloudShell (No Installation Needed)

### Step 1: Open AWS CloudShell
1. Go to: https://console.aws.amazon.com/
2. Click the **CloudShell icon** (looks like `>_`) in the top menu bar
3. Wait for CloudShell to open (first time takes a minute)

### Step 2: Install PostgreSQL Client
```bash
sudo yum install -y postgresql15
```

### Step 3: Run the Migration
```bash
psql "postgresql://doresdblogin:vandydoresdine@doresdine-db.c78uu0gy0jpq.us-east-2.rds.amazonaws.com:5432/doresdine" -c "ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100), ADD COLUMN IF NOT EXISTS last_name VARCHAR(100), ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255), ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false, ADD COLUMN IF NOT EXISTS verification_code VARCHAR(20), ADD COLUMN IF NOT EXISTS verification_code_expires TIMESTAMPTZ; CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);"
```

---

## Option 4: Using a Database GUI Tool

If you have **pgAdmin**, **DBeaver**, **TablePlus**, or similar:

1. Connect to your database:
   - **Host:** `doresdine-db.c78uu0gy0jpq.us-east-2.rds.amazonaws.com`
   - **Port:** `5432`
   - **Database:** `doresdine`
   - **Username:** `doresdblogin`
   - **Password:** `vandydoresdine`

2. Open a SQL query window
3. Paste the migration SQL (from Option 1, Step 5)
4. Execute it

---

## Verify Migration Worked

After running the migration, test it:

```bash
curl -X POST "http://Doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com/auth/register" -H "Content-Type: application/json" -d '{"first_name":"Test","last_name":"User","email":"testuser3@vanderbilt.edu","password":"test123"}'
```

Should return: `{"message":"User created, verify your email",...}` instead of an error.

---

## Still Can't Find It?

If you can't find Query Editor in RDS:
1. **Check if Query Editor is enabled** - Some RDS instances need it enabled first
2. **Use Option 2 (psql)** - Usually the most reliable
3. **Use Option 3 (CloudShell)** - Works from any browser, no installation

Let me know which option you want to try!


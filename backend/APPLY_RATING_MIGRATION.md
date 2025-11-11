# Apply Rating Migration

## What This Does

Changes the `rating` column in the `posts` table from `INTEGER` to `NUMERIC(3,1)` to support decimal ratings (e.g., 3.2, 8.1, 9.5).

## How to Apply

### Option 1: Direct Database Connection

If you have direct access to your RDS database:

```bash
# Connect to your database
psql -h doresdine-db.c78uu0gy0jpq.us-east-2.rds.amazonaws.com \
     -U doresdblogin \
     -d doresdine \
     -f migrations/003_alter_rating_to_decimal.sql
```

### Option 2: Via AWS RDS Query Editor

1. Go to AWS RDS Console
2. Select your database instance
3. Click "Query Editor" or use a database client
4. Run the SQL from `migrations/003_alter_rating_to_decimal.sql`:

```sql
ALTER TABLE posts 
  ALTER COLUMN rating TYPE NUMERIC(3,1) 
  USING rating::NUMERIC(3,1);

ALTER TABLE posts 
  DROP CONSTRAINT IF EXISTS posts_rating_check;

ALTER TABLE posts 
  ADD CONSTRAINT posts_rating_check 
  CHECK (rating >= 1.0 AND rating <= 10.0);
```

### Option 3: Via psql with Environment Variable

```bash
cd backend
export PGPASSWORD=vandydoresdine
psql -h doresdine-db.c78uu0gy0jpq.us-east-2.rds.amazonaws.com \
     -U doresdblogin \
     -d doresdine \
     -f migrations/003_alter_rating_to_decimal.sql
```

## Verify Migration

After applying, verify the change:

```sql
-- Check column type
SELECT column_name, data_type, numeric_precision, numeric_scale
FROM information_schema.columns
WHERE table_name = 'posts' AND column_name = 'rating';

-- Should show: NUMERIC, precision: 3, scale: 1

-- Test with a decimal value
UPDATE posts SET rating = 7.5 WHERE id = (SELECT id FROM posts LIMIT 1);
SELECT rating FROM posts WHERE rating = 7.5;
```

## What Changed

- **Database**: `rating` column now accepts `NUMERIC(3,1)` (1 decimal place)
- **Frontend**: Slider now allows 0.1 steps (1.0 to 10.0)
- **Frontend**: Displays rating with 1 decimal place (e.g., "7.5")
- **API**: Validates and sends decimal ratings correctly

## Notes

- Existing integer ratings (1, 2, 3, etc.) will be automatically converted to decimals (1.0, 2.0, 3.0)
- The constraint still enforces 1.0 <= rating <= 10.0
- All ratings are stored with exactly 1 decimal place precision


#!/bin/bash

# Run a specific migration file against the PostgreSQL database
# Usage: ./run-single-migration.sh <migration_file>

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Check if migration file is provided
if [ -z "$1" ]; then
  echo "❌ Error: No migration file specified"
  echo "Usage: ./run-single-migration.sh <migration_file>"
  echo "Example: ./run-single-migration.sh migrations/013_add_post_rated_items.sql"
  exit 1
fi

MIGRATION_FILE="$1"

# Check if file exists
if [ ! -f "$MIGRATION_FILE" ]; then
  echo "❌ Error: Migration file not found: $MIGRATION_FILE"
  exit 1
fi

# Database connection details from .env
DB_HOST="${DB_HOST:-doresdine-db.c78uu0gy0jpq.us-east-2.rds.amazonaws.com}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-doresdine_db}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD}"

if [ -z "$DB_PASSWORD" ]; then
  echo "❌ Error: DB_PASSWORD not set in .env file"
  exit 1
fi

echo "🔄 Running migration: $MIGRATION_FILE"
echo "📍 Database: $DB_NAME on $DB_HOST"

# Run the migration
PGPASSWORD="$DB_PASSWORD" psql \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -f "$MIGRATION_FILE"

if [ $? -eq 0 ]; then
  echo "✅ Migration completed successfully!"
else
  echo "❌ Migration failed!"
  exit 1
fi

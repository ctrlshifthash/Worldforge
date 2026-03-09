#!/bin/sh
# Railway startup script — initializes SQLite on persistent volume

DB_PATH="${DATABASE_URL#file:}"

# If the database doesn't exist yet, create schema and seed
if [ ! -f "$DB_PATH" ]; then
  echo "First deploy — creating database at $DB_PATH"
  npx prisma db push --skip-generate
  echo "Seeding database..."
  npx prisma db seed
else
  echo "Database exists at $DB_PATH — pushing schema updates"
  npx prisma db push --skip-generate
fi

# Start the Next.js production server
node_modules/.bin/next start -H 0.0.0.0 -p ${PORT:-3000}

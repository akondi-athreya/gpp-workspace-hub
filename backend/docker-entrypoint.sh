#!/usr/bin/env sh
set -e

# Wait for database to be ready
echo "⏳ Waiting for database..."
until node -e "const { Client } = require('pg'); const c = new Client({ connectionString: process.env.DATABASE_URL }); c.connect().then(()=>c.end()).catch(()=>{ throw new Error('DB not ready'); });" >/dev/null 2>&1; do
  sleep 2
  echo "...still waiting"
done

echo "✅ Database reachable"

# Run migrations and generate client
npx prisma migrate deploy
npx prisma generate

# Seed data (continue if already seeded)
node prisma/seed.js || true

# Start server
node src/server.js

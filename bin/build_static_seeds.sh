#! /usr/bin/env bash
PGURL='postgres://admin:Password123@localhost:5432/upchieve?sslmode=disable' 

if [[ -n "$1" ]]
then
  numzip=$1
fi

# build seeds from source
npx ts-node -P tsconfig.seeds.json database/seeds/staticSeeds.ts "$numzip"

# apply seed migrations
dbmate \
  -d ./database/seed-updates \
  --no-dump-schema \
  --migrations-table 'seed_migrations' \
  -u "$PGURL" \
  up > /dev/null

# dump migrations
PGPASSFILE="database/.pgpass" pg_dump -a -f database/db_init/seed_migrations.sql -t seed_migrations -h localhost -p 5432 -U admin upchieve

if [[ -n "$1" ]]
then
  npx ts-node -P tsconfig.seeds.json database/seeds/testSeeds.ts
fi
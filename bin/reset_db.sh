#! /usr/bin/env bash

# exit with nonzero code on any errors
set -o errexit

# temporarily stop pgAmdin container
docker ps -q --filter "name=subway_pgadmin_1" | grep -q . && docker stop subway_pgadmin_1

PGURL='postgres://admin:Password123@localhost:5432/upchieve?sslmode=disable' 

# drop upchieve database
dbmate --url $PGURL drop

# rebuild schema from scratch
dbmate \
  -d ./database/migrations \
  --no-dump-schema \
  --url $PGURL \
  --migrations-table 'schema_migrations' \
  up \
  > /dev/null

# drop seed migrations table
PGPASSFILE="database/.pgpass" psql -w -h localhost -p 5432 -d upchieve -U admin -c "DELETE FROM public.seed_migrations" >/dev/null

# reapply auth credentials to subway user
PGPASSFILE="database/.pgpass" psql -w -h localhost -p 5432 -d upchieve -f ./database/db_init/auth.sql -U admin >/dev/null

# restart mgAdmin container
docker ps -q --all --filter "name=subway_pgadmin_1" | grep -q . && docker start subway_pgadmin_1

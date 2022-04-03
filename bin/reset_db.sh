#! /usr/bin/env bash

# exit with nonzero code on any errors
set -o errexit

docker ps -q --filter "name=subway_pgadmin_1" | grep -q . && docker stop subway_pgadmin_1

PGURL='postgres://admin:Password123@localhost:5432/upchieve?sslmode=disable' 

dbmate --url $PGURL drop

dbmate \
  --no-dump-schema \
  --url $PGURL \
  up \
  > /dev/null

PGPASSFILE="database/.pgpass" psql -w -h localhost -p 5432 -d upchieve -f ./database/db_init/auth.sql -U admin >/dev/null

docker ps -q --all --filter "name=subway_pgadmin_1" | grep -q . && docker start subway_pgadmin_1

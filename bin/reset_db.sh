#! /usr/bin/env bash

# exit with nonzero code on any errors
set -o errexit

docker ps -q --filter "name=subway_pgadmin_1" | grep -q . && docker stop subway_pgadmin_1

dbmate --url 'postgres://admin:Password123@localhost:5432/upchieve?sslmode=disable' drop
dbmate --no-dump-schema --url 'postgres://admin:Password123@localhost:5432/upchieve?sslmode=disable' up
psql -h localhost -p 5432 -d upchieve -f ./database/auth.sql -U admin

npm run dev:init:sql

docker ps -q --all --filter "name=subway_pgadmin_1" | grep -q . && docker start subway_pgadmin_1

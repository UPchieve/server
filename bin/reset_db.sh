#! /usr/bin/env bash

# exit with nonzero code on any errors
set -o errexit

# temporarily stop pgAmdin container
docker ps -q --filter "name=subway-pgadmin-1" | grep -q . && docker stop subway-pgadmin-1 1> /dev/null

PGPASSFILE='database/.pgpass' dropdb -h localhost -p 5432 -U admin -w --if-exists upchieve 1> /dev/null
PGPASSFILE='database/.pgpass' psql -w -h localhost -p 5432 -d postgres -U admin -c "create database upchieve;" 1> /dev/null

# restart pgAdmin container
docker ps -q --all --filter "name=subway-pgadmin-1" | grep -q . && docker start subway-pgadmin-1 1> /dev/null

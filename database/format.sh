#! /usr/bin/env bash

for filename in database/migrations/*.sql; do
    [ -e "$filename" ] || continue
    pg_format --keyword-case=1 --inplace "$filename"
done

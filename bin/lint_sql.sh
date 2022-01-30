#! /usr/bin/env bash

for filename in server/**/**/*.sql; do
    [ -e "$filename" ] || continue
    npx pg-formatter --keyword-case="uppercase" --inplace --placeholder=":\w+!" "$filename"
done

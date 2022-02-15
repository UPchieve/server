#! /usr/bin/env bash

for filename in $1; do
    [ -e "$filename" ] || continue
    npx pg-formatter --keyword-case="uppercase" --inplace --placeholder=":\w+!" "$filename"
done

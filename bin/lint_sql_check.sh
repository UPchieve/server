#! /usr/bin/env bash

echo "linting files in server/"
for filename in $(find ./server -name "*.sql"); do
    [ -e "$filename" ] || continue
    npx pg-formatter --keyword-case="uppercase" --inplace --placeholder=":\w+!" "$filename"
done

echo "linting files in database/migrations"
for filename in $(find ./database/migrations -name "*.sql"); do
  [ -e "$filename" ] || continue
  npx pg-formatter --keyword-case="uppercase" --inplace --placeholder=":\w+!" "$filename"
done

echo "linting files in database/seed-updates"
for filename in $(find ./database/seed-updates -name "*.sql"); do
  [ -e "$filename" ] || continue
  npx pg-formatter --keyword-case="uppercase" --inplace --placeholder=":\w+!" "$filename"
done

echo "linting files in database/seeds"
for filename in $(find ./database/seed-updates -name "*.sql"); do
  [ -e "$filename" ] || continue
  npx pg-formatter --keyword-case="uppercase" --inplace --placeholder=":\w+!" "$filename"
done

if [[ $(git ls-files -m "*.sql") ]]; then
  echo "SQL code changes made by pg-formatter, please stage the files and try again."
  exit 1
else
  echo "No sql code changes made by pg-formatter!"
  exit 0
fi

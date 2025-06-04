#! /usr/bin/env bash

STAGED_SQL_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.sql$')

if [[ -z "$STAGED_SQL_FILES" ]]; then
  echo "No staged SQL files found, skipping SQL linting."
  exit 0
fi

echo "Linting staged SQL files..."
for filename in $STAGED_SQL_FILES; do
  [ -e "$filename" ] || continue
  echo "Linting $filename"
  npx pg-formatter --keyword-case="uppercase" --inplace --placeholder=":\w+!" "$filename"
done

if [[ $(git ls-files -m "*.sql") ]]; then
  echo "SQL code changes made by pg-formatter, please stage the files and try again."
  exit 1
fi

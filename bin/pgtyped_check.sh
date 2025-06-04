#! /usr/bin/env bash

STAGED_SQL_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '^server/models/.*\.sql$')

if [[ -z "$STAGED_SQL_FILES" ]]; then
  echo "No staged SQL files found in server/models/, skipping pgtyped check."
  exit 0
fi

echo "Found staged SQL files in server/models/, running pgtyped check..."
npx pgtyped -c pgtyped.config.json

if [[ $(git ls-files -m "*.queries.ts") ]]; then
  echo "Changes made by pgtyped, please stage the files and try again."
  exit 1
fi

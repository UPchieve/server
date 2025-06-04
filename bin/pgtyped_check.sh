#! /usr/bin/env bash

npx pgtyped -c pgtyped.config.json

if [[ $(git ls-files -m "*.queries.ts") ]]; then
  echo "Changes made by pgtyped, please stage the files and try again."
  exit 1
else
  echo "No code changes made by pgtyped!"
  exit 0
fi

#! /usr/bin/env bash

EXIT_CODE=0

echo "Checking for instances of PoolClient.connect()"
echo ""

MATCHES=$(grep -rn --include="*.js" --include="*.ts" --exclude="./server/db.ts" -E '.*[a-zA-Z0-9_]*client\.connect\(\).*|.*[a-zA-Z0-9_]*Client\.connect\(\).*|.*getClient\(\)\.connect\(\).*' ./server)
if [ ! -z "$MATCHES" ]; then
  echo "Found client.connect() in files:"
  echo ""
  echo "$MATCHES"
  echo ""
  EXIT_CODE=1
fi

if [ "$EXIT_CODE" -eq 0 ]; then
  echo "✅ No uses of PoolClient.connect() detected"
else
  echo "🚫 Detected potential use of PoolClient.connect()! Please fix before committing."
  echo ""
  echo "Why do this? See retrospective: https://gitlab.com/groups/upchieve/-/wikis/0-On-Call-Rotation/z-Retrospectives/2025-04-14?redirected_from=0-On-Call-Rotation/z-Retrospectives/2025.04.14"
fi

exit $EXIT_CODE

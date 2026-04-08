#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "Usage: $0 <target_db_url> <import_file>"
  exit 1
fi

TARGET_DB_URL="$1"
IMPORT_SQL="$2"

if [ ! -f "$IMPORT_SQL" ]; then
  echo "❌ Import file not found: $IMPORT_SQL"
  exit 1
fi

echo "📥 Loading import dump into target DB..."
echo "File: $IMPORT_SQL"
echo ""

psql "$TARGET_DB_URL" -v ON_ERROR_STOP=1 -f "$IMPORT_SQL"

echo ""
echo "✅ Import complete"
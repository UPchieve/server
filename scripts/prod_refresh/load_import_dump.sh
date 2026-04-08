#!/usr/bin/env bash
set -euo pipefail

TARGET_DB_URL="${1:?Usage: $0 <target_db_url> <import_file>}"
IMPORT_SQL="${2:?Usage: $0 <target_db_url> <import_file>}"

psql "$TARGET_DB_URL" -f "$IMPORT_SQL"
#!/usr/bin/env bash
set -euo pipefail

INPUT_FILE="$1"
OUTPUT_FILE="$2"

perl -0pe '
  # remove sequence resets
  s/^SELECT pg_catalog\.setval\(.*\);\n?//mg;

  # rewrite INSERT statements
  s/\bINSERT INTO\s+"?upchieve"?\./INSERT INTO import_upchieve./g;

  # rewrite COPY statements
  s/\bCOPY\s+"?upchieve"?\./COPY import_upchieve./g;

  # rewrite ALTER TABLE (with or without ONLY)
  s/\bALTER TABLE\s+(ONLY\s+)?"?upchieve"?\./ALTER TABLE \1import_upchieve./g;

' "$INPUT_FILE" > "$OUTPUT_FILE"

echo "Wrote $OUTPUT_FILE"
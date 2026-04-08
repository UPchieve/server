#!/usr/bin/env bash
set -euo pipefail

INPUT_FILE="${1:?Usage: $0 <input> <output>}"
OUTPUT_FILE="${2:?Usage: $0 <input> <output>}"

perl -0ne '
  next if /\bSELECT pg_catalog\.setval\(/;
  s/\bINSERT INTO upchieve\./INSERT INTO import_upchieve\./g;
  s/\bCOPY upchieve\./COPY import_upchieve\./g;
  print;
' "$INPUT_FILE" > "$OUTPUT_FILE"

echo "Wrote $OUTPUT_FILE"
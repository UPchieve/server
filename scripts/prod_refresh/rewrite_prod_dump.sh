#!/usr/bin/env bash
set -euo pipefail

INPUT_FILE="${1:?Usage: $0 <input> <output>}"
OUTPUT_FILE="${2:?Usage: $0 <input> <output>}"

perl -0pe '
  s/^SELECT pg_catalog\.setval\(.*\);\n?//mg;
  s/\bupchieve\./import_upchieve./g;
  s/"upchieve"\./"import_upchieve"./g;
' "$INPUT_FILE" > "$OUTPUT_FILE"

echo "Wrote $OUTPUT_FILE"
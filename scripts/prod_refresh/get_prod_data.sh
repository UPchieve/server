#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "Usage: $0 <prod_db_url> <output_file>"
  exit 1
fi

PROD_DB_URL="$1"
OUT_FILE="$2"

if [ -e "$OUT_FILE" ]; then
  echo "ℹ️  Output file already exists: $OUT_FILE"
  echo "   Skipping dump to avoid overwrite."
  echo "   Delete the file first if you want a fresh prod pull."
  exit 0
fi

echo "📦 Dumping reference data from prod..."
echo "Output file: $OUT_FILE"
echo ""

pg_dump "$PROD_DB_URL" \
  --data-only \
  --column-inserts \
  --table=upchieve.cities \
  --table=upchieve.schools \
  --table=upchieve.subjects \
  --table=upchieve.certifications \
  --table=upchieve.certification_subject_unlocks \
  --table=upchieve.computed_subject_unlocks \
  --table=upchieve.quizzes \
  --table=upchieve.quiz_subcategories \
  --table=upchieve.quiz_questions \
  --table=upchieve.quiz_review_materials \
  --table=upchieve.quiz_certification_grants \
  > "$OUT_FILE"

echo ""
echo "✅ Dump complete: $OUT_FILE"
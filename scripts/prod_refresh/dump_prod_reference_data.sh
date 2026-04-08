#!/usr/bin/env bash
set -euo pipefail

PROD_DB_URL="${1:?Usage: $0 <prod_db_url> <output_file>}"
OUT_FILE="${2:?Usage: $0 <prod_db_url> <output_file>}"

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

echo "Wrote $OUT_FILE"
#!/usr/bin/env bash
set -euo pipefail

DRY_RUN=false

if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
  shift
fi

if [ "$#" -lt 1 ] || [ "$#" -gt 3 ]; then
  echo "Usage: $0 [--dry-run] <prod_db_url> [target_db_url] [working_dir]"
  exit 1
fi

PROD_DB_URL="$1"
TARGET_DB_URL="${2:-${TARGET_DB_URL:-postgres://admin@localhost:5432/upchieve}}"
WORKDIR="${3:-.}"

TIMESTAMP="$(date +%Y-%m-%d_%H%M)"

DUMP_SQL="$WORKDIR/prod_dump_${TIMESTAMP}.sql"
IMPORT_SQL="$WORKDIR/prod_dump_${TIMESTAMP}_rewritten.sql"

MASKED_TARGET_DB_URL="$(echo "$TARGET_DB_URL" | sed -E 's#(postgres://[^:]+):[^@]+@#\1:***@#')"

echo ""
echo "========================================"
echo "🚀 Starting DB refresh from prod"
echo "========================================"
echo "Timestamp: $TIMESTAMP"
echo "Dry run:   $DRY_RUN"
echo "Target DB: $MASKED_TARGET_DB_URL"
echo ""

# Warn if local DB but no password set
if [[ "$TARGET_DB_URL" == *"localhost"* && -z "${PGPASSWORD:-}" ]]; then
  echo "⚠️  Warning: PGPASSWORD not set for local DB"
  echo "   Run: export PGPASSWORD=Password123"
  echo ""
fi

run_or_echo() {
  if [ "$DRY_RUN" = true ]; then
    echo "🧪 [DRY RUN] $*"
  else
    eval "$@"
  fi
}

# ----------------------------------------

if [ "$DRY_RUN" = true ]; then
  echo "🧪 [DRY RUN] Skipping prod dump"
  echo "🧪 [DRY RUN] Would write raw dump to: $DUMP_SQL"
  echo ""
else
  echo "📦 Step 1: Dumping prod reference data..."
  "$WORKDIR/dump_prod_reference_data.sh" "$PROD_DB_URL" "$DUMP_SQL"
  echo "✅ Dump complete: $DUMP_SQL"
  echo ""
fi

# ----------------------------------------

echo "🧱 Step 2: Preparing import schema..."
run_or_echo "psql \"$TARGET_DB_URL\" -v ON_ERROR_STOP=1 -f \"$WORKDIR/00_prepare_import_schema.sql\""
echo ""

# ----------------------------------------

if [ "$DRY_RUN" = true ]; then
  echo "🧪 [DRY RUN] Skipping dump rewrite"
  echo "🧪 [DRY RUN] Would write rewritten dump to: $IMPORT_SQL"
  echo ""
else
  echo "🔄 Step 3: Rewriting dump..."
  "$WORKDIR/rewrite_prod_dump.sh" "$DUMP_SQL" "$IMPORT_SQL"
  echo "✅ Rewrite complete: $IMPORT_SQL"
  echo ""
fi

# ----------------------------------------

echo "📥 Step 4: Loading import data..."
run_or_echo "\"$WORKDIR/load_import_dump.sh\" \"$TARGET_DB_URL\" \"$IMPORT_SQL\""
echo ""

# ----------------------------------------

echo "💾 Step 5: Backing up preserved tables..."
run_or_echo "psql \"$TARGET_DB_URL\" -v ON_ERROR_STOP=1 -f \"$WORKDIR/01_backup_preserved_tables.sql\""
echo ""

# ----------------------------------------

echo "🔁 Step 6: Refreshing + remapping..."
run_or_echo "psql \"$TARGET_DB_URL\" -v ON_ERROR_STOP=1 -f \"$WORKDIR/02_refresh_reference_tables.sql\""
echo ""

# ----------------------------------------

echo "🔍 Step 7: Validating..."
run_or_echo "psql \"$TARGET_DB_URL\" -v ON_ERROR_STOP=1 -f \"$WORKDIR/03_validate_refresh.sql\""
echo ""

# ----------------------------------------

if [ "$DRY_RUN" = true ]; then
  echo "🧪 [DRY RUN] Skipping cleanup"
else
  echo "🧹 Step 8: Cleaning up helper schemas..."
  psql "$TARGET_DB_URL" -v ON_ERROR_STOP=1 -f "$WORKDIR/04_cleanup_refresh_artifacts.sql"
  echo ""
fi

# ----------------------------------------

echo "========================================"
echo "🎉 Done"
echo "========================================"
echo ""
echo "Artifacts:"
echo "  Raw dump:        $DUMP_SQL"
echo "  Rewritten dump:  $IMPORT_SQL"
echo ""
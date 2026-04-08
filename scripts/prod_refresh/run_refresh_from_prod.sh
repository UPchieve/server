#!/usr/bin/env bash
set -euo pipefail

trap 'echo "❌ Script failed at line $LINENO"; exit 1' ERR

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
DATA_DIR="$WORKDIR/data"

mkdir -p "$DATA_DIR"
echo "📁 Data directory: $DATA_DIR"

DATE_STAMP="$(date +%d-%m-%Y)"

LOG_DIR="$WORKDIR/logs"
mkdir -p "$LOG_DIR"

LOG_FILE="$LOG_DIR/db_refresh_${DATE_STAMP}.log"

DUMP_SQL="$DATA_DIR/prod_dump_${DATE_STAMP}.sql"
IMPORT_SQL="$DATA_DIR/prod_dump_${DATE_STAMP}_rewritten.sql"

MASKED_TARGET_DB_URL="$(echo "$TARGET_DB_URL" | sed -E 's#(postgres://[^:]+):[^@]+@#\1:***@#')"

echo ""
echo "========================================"
echo "🚀 Starting DB refresh from prod"
echo "========================================"
echo "Date stamp: $DATE_STAMP"
echo "Dry run:    $DRY_RUN"
echo "Target DB:  $MASKED_TARGET_DB_URL"
echo "📝 Logging to: $LOG_FILE"
echo ""

# Pipe all output to both terminal and log file
exec > >(tee -a "$LOG_FILE") 2>&1

if [[ "$TARGET_DB_URL" == *"localhost"* && -z "${PGPASSWORD:-}" ]]; then
  echo "⚠️  Warning: PGPASSWORD not set for local DB"
  echo "   Run: export PGPASSWORD=Password123"
  echo ""
fi

run_or_echo() {
  if [ "$DRY_RUN" = true ]; then
    echo "🧪 [DRY RUN] $*"
  else
    "$@"
  fi
}

if [ "$DRY_RUN" = true ]; then
  echo "🧪 [DRY RUN] Skipping prod dump"
  echo "🧪 [DRY RUN] Would use raw dump: $DUMP_SQL"
  echo ""
else
  if [ -f "$DUMP_SQL" ]; then
    echo "📦 Step 1: Reusing existing prod dump"
    echo "✅ Found: $DUMP_SQL"
    echo ""
  else
    echo "📦 Step 1: Dumping prod reference data..."
    "$WORKDIR/get_prod_data.sh" "$PROD_DB_URL" "$DUMP_SQL"
    echo "✅ Dump complete"
    echo ""
  fi
fi

echo "🧱 Step 2: Preparing import schema..."
run_or_echo psql "$TARGET_DB_URL" -v ON_ERROR_STOP=1 -f "$WORKDIR/00_prepare_import_schema.sql"
echo ""

if [ "$DRY_RUN" = true ]; then
  echo "🧪 [DRY RUN] Skipping rewrite"
  echo "🧪 [DRY RUN] Would use rewritten dump: $IMPORT_SQL"
  echo ""
else
  if [ -f "$IMPORT_SQL" ]; then
    echo "🔄 Step 3: Reusing existing rewritten dump"
    echo "✅ Found: $IMPORT_SQL"
    echo ""
  else
    echo "🔄 Step 3: Rewriting dump..."
    "$WORKDIR/rewrite_prod_dump.sh" "$DUMP_SQL" "$IMPORT_SQL"
    echo "✅ Rewrite complete"
    echo ""
  fi
fi

echo "📥 Step 4: Loading import data..."
run_or_echo "$WORKDIR/load_import_dump.sh" "$TARGET_DB_URL" "$IMPORT_SQL"
echo ""

echo "💾 Step 5: Backing up preserved tables..."
run_or_echo psql "$TARGET_DB_URL" -v ON_ERROR_STOP=1 -f "$WORKDIR/01_backup_preserved_tables.sql"
echo ""

echo "🔁 Step 6: Refreshing + remapping..."
run_or_echo psql "$TARGET_DB_URL" -v ON_ERROR_STOP=1 -f "$WORKDIR/02_refresh_core_data.sql"
echo ""

echo "🔍 Step 7: Validating..."
run_or_echo psql "$TARGET_DB_URL" -v ON_ERROR_STOP=1 -f "$WORKDIR/03_validate_refresh.sql"
echo ""

if [ "$DRY_RUN" = true ]; then
  echo "🧪 [DRY RUN] Skipping cleanup"
else
  echo "🧹 Step 8: Cleaning up..."
  psql "$TARGET_DB_URL" -v ON_ERROR_STOP=1 -f "$WORKDIR/04_cleanup_refresh_artifacts.sql"
  echo ""
fi

echo "🎉 Done"
echo "Artifacts:"
echo "  Raw dump:       $DUMP_SQL"
echo "  Rewritten dump: $IMPORT_SQL"
echo ""
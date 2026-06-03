#!/usr/bin/env bash
#
# Installs analytics tables + functions by applying setup.sql.
#
# Run order on a fresh DB (once per environment):
#   1. avnadmin runs the superuser bootstrap (anon extension, REVOKEs,
#      event-trigger registration). See README.md "Production bootstrap".
#   2. dbmate runs operational migrations (creates analytics schema +
#      roles + base grants).
#   3. bash database/analytics/setup.sh   ← this script
#   4. bash database/analytics/sync-masking-rules.sh
#   5. bash database/analytics/sync-layer2-views.sh
#
# setup.sql is fully idempotent; safe to re-run when it changes.
# Connection comes from standard PG* env vars. Runs as analytics_privacy_admin
# in CI; locally any role with CREATE on the analytics schema works.

set -eo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

psql --single-transaction --set ON_ERROR_STOP=on -f "$SCRIPT_DIR/setup.sql"

echo "database/analytics/setup.sql applied."

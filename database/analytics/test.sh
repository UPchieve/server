#!/usr/bin/env bash
#
# Runs the analytics smoke test against a local DB. Order:
#   1. setup.sh           — install tables + functions.
#   2. sync-masking-rules — install the real _blanket_rules() body + custom
#                           rules from database/privacy/*.sql.
#   3. apply.sh           — call analytics.rebuild() once (belt-and-suspenders).
#   4. tests/smoke.sql    — exercise the pipeline; ROLLBACK at the end so
#                           DB state is unchanged.
#
# Assumes:
#   - dbmate has applied the operational migrations (analytics schema +
#     roles + base grants exist).
#   - The anon extension is installed (the smoke doesn't actually invoke
#     anon functions, but pgsql-parser still parses 'MASKED WITH FUNCTION'
#     labels in the wild).
#
# Connection comes from standard PG* env vars.

set -eo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

./setup.sh
./sync-masking-rules.sh
./apply.sh
psql --set ON_ERROR_STOP=on -f tests/smoke.sql

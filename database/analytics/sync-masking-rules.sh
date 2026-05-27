#!/usr/bin/env bash
#
# Syncs masking-rule files (database/privacy/01-blanket-labels.sql,
# database/privacy/02-custom-labels.sql) into the analytics-side artifacts
# they back:
#   * file 1's BLANKET_QUERY block → body of analytics._blanket_rules()
#   * file 2's SECURITY LABEL stmts → rows of analytics._custom_rules
# Then calls analytics.rebuild(). One Postgres transaction.
#
# The parsing happens in database/analytics/sync-masking-rules.ts (uses pgsql-parser). The
# .ts emits SQL on stdout; this script pipes it into psql.
#
# Connection comes from standard PG* env vars. Requires INSERT/UPDATE/
# DELETE/SELECT on analytics._custom_rules, CREATE on the analytics schema
# (to replace _blanket_rules()), and EXECUTE on analytics.rebuild() — all
# held by the analytics_privacy_admin role.

set -eo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/../.."

pnpm exec ts-node database/analytics/sync-masking-rules.ts | psql --set ON_ERROR_STOP=on

echo "Masking rules synced (blanket function reinstalled, custom rules upserted, rebuild called)."

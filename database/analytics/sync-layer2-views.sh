#!/usr/bin/env bash
#
# Syncs Layer 2 view files (database/analytics/views/*.sql) into the
# analytics._layer_2_view_defs table, then calls analytics.rebuild() so
# the views get applied. Everything runs in a single Postgres transaction.
#
# Used by the sync_analytics_layer2_views CI job, but safe to run by hand
# during local development.
#
# Connection comes from standard PG* env vars. Requires INSERT/UPDATE/
# DELETE/SELECT on analytics._layer_2_view_defs and EXECUTE on
# analytics.rebuild() — both held by the analytics_layer2_admin role.

set -eo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

shopt -s nullglob
view_files=( views/*.sql )

# The migration's rebuild() function trusts the sql stored in
# _layer_2_view_defs and EXECUTEs it verbatim. We use dollar-quoting to
# transport multi-line SQL from shell to psql without escaping pain. If a
# view file ever happens to contain the dollar-quote tag we use, we'd
# silently corrupt its sql — refuse to sync in that case.
DOLLAR_TAG='$LAYER2VIEW$'

for f in "${view_files[@]}"; do
  if grep -F -q "$DOLLAR_TAG" "$f"; then
    echo "FAIL: $f contains the reserved dollar-quote tag $DOLLAR_TAG."
    echo "      Rewrite the view to not use that literal string, or pick a"
    echo "      different DOLLAR_TAG in sync-layer2-views.sh."
    exit 1
  fi
  name="$(basename "$f" .sql)"
  if ! [[ "$name" =~ ^[a-z][a-z0-9_]*$ ]]; then
    echo "FAIL: $f has an invalid view name '$name'."
    echo "      Names must match ^[a-z][a-z0-9_]*$ (lower-case only, no"
    echo "      spaces, no quotes). Uppercase is rejected because Postgres"
    echo "      folds the unquoted relname to lower-case, so an override file"
    echo "      named e.g. Users.sql would never match the upchieve.users"
    echo "      table in rebuild() and would leave the default passthrough in"
    echo "      place alongside the override."
    exit 1
  fi
done

{
  echo "SET client_min_messages = WARNING;"
  echo "BEGIN;"
  echo "CREATE TEMP TABLE _desired (name text PRIMARY KEY, sql text NOT NULL) ON COMMIT DROP;"

  for f in "${view_files[@]}"; do
    name="$(basename "$f" .sql)"
    cat <<EOSQL
INSERT INTO _desired (name, sql) VALUES (
  '$name',
  \$LAYER2VIEW\$
$(cat "$f")
\$LAYER2VIEW\$
);
EOSQL
  done

  cat <<'EOSQL'
INSERT INTO analytics._layer_2_view_defs (name, sql)
  SELECT name, sql FROM _desired
  ON CONFLICT (name) DO UPDATE
    SET sql        = EXCLUDED.sql,
        updated_at = now();

DELETE FROM analytics._layer_2_view_defs
  WHERE name NOT IN (SELECT name FROM _desired);

SELECT analytics.rebuild();

COMMIT;
EOSQL
} | psql --set ON_ERROR_STOP=on

echo "Synced ${#view_files[@]} Layer 2 view(s) and called rebuild."

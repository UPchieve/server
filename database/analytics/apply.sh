#!/usr/bin/env bash
#
# Triggers analytics.rebuild() — Layer 1 + Layer 2 in one transaction.
#
# Production / staging do NOT need this run manually: the Postgres event
# trigger registered during bootstrap fires rebuild() on every upchieve.*
# DDL automatically, and the sync_analytics_layer2_views CI job calls
# rebuild() after upserting Layer 2 view files.
#
# This script remains useful for:
#   - Local development (run after dbmate up to refresh views in your dev DB).
#   - One-time bootstrap on a fresh DB.
#   - Recovery (force-rebuild after manually editing the schema or after
#     a Layer 2 cascade-drop that for some reason wasn't auto-recovered).
#
# Connection comes from standard PG* env vars: PGHOST, PGPORT, PGUSER,
# PGPASSWORD, PGDATABASE.
#
# Requires: dbmate migrations have run (which installs analytics.rebuild()).

set -eo pipefail

psql --single-transaction --set ON_ERROR_STOP=on <<'SQL'
SET client_min_messages = WARNING;
SELECT analytics.rebuild();
-- Belt-and-suspenders: rebuild() drops and recreates every analytics view,
-- so any view owned by a role other than subway won't be covered by the
-- `ALTER DEFAULT PRIVILEGES FOR ROLE subway` grant. Re-grant explicitly so
-- the analytics_ro consumer can always read after a manual/recovery rebuild.
-- (Requires the connecting role to own the views or be superuser.)
GRANT SELECT ON ALL TABLES IN SCHEMA analytics TO analytics_ro;
SQL

echo "analytics.rebuild() complete."

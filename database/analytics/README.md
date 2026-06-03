# analytics

The UPchieve analytics environment. Layer 1 (auto-generated PII-masked views
of every `upchieve.<table>`) plus Layer 2 (hand-written semantic views in
`views/`). Both live in the `analytics` Postgres schema; both are rebuilt
by `analytics.rebuild()`.

Production / staging stays in sync **automatically**:

- A Postgres event trigger fires `analytics.rebuild()` on every DDL that
  touches `upchieve.*` (operator-driven migrations, manual psql,
  anything). Layer 1 + Layer 2 rebuild atomically inside the migration's
  transaction.
- A CI job (`sync_analytics_layer2_views`) syncs the contents of
  `views/*.sql` into the `analytics._layer_2_view_defs` table when those
  files change, then calls `rebuild()` to apply. The rebuild function
  reads from that table for Layer 2, so the views land regardless of
  which trigger fired the rebuild.

`apply.sh` is no longer the primary driver — it's left in for local dev,
bootstrap, and recovery.

## Layout

- `apply.sh` — calls `SELECT analytics.rebuild()`. Useful for local dev
  and recovery. Production uses automatic triggers.
- `sync-layer2-views.sh` — upserts `views/*.sql` into
  `analytics._layer_2_view_defs`, then calls `rebuild()`. Used by the
  CI sync job; safe to run manually.
- `views/` — hand-written Layer 2 views, plain SQL files. Filename
  matching an `upchieve.<table>` name overrides the default Layer 1
  pass-through; any other filename creates a net-new view.
- `tests/smoke.sql` + `test.sh` — local smoke test exercising the rebuild
  and masking. Wraps everything in a transaction with ROLLBACK so DB
  state is unchanged.

The `analytics.rebuild()` function itself lives in `setup.sql` (applied by
`setup.sh`), alongside `_layer_2_view_defs`, `_custom_rules`,
`_blanket_rules()`, and `on_upchieve_ddl()`. The roles, schema, and base
grants live in the migration
`database/migrations/20260515140600_replace_basic_access_with_analytics_schema.sql`.

## How it works

`analytics.rebuild()` does two passes in one transaction:

1. **Layer 1**: drop every existing view in `analytics` (`DROP VIEW … CASCADE`),
   then, for every `upchieve.<table>`, create `analytics._<table>` (internal,
   PII-masked passthrough) and — unless a Layer 2 def of that name exists —
   `analytics.<table>` (default public passthrough). It's an always-rebuild:
   everything is dropped and recreated from scratch, and Layer 2 is always
   re-applied at the end, so there's no need to preserve dependent views
   during Layer 1.
2. **Layer 2**: iterates `analytics._layer_2_view_defs` (which CI keeps
   in sync with `views/*.sql`), ordered by name, and `EXECUTE`s each row's
   sql. Note there is no dependency resolution: a Layer 2 view that
   references another Layer 2 view (or an overridden public view) must sort
   alphabetically *after* its dependency, or the rebuild fails.

Two triggers, one execution path:

- DDL on `upchieve.*` → Postgres event trigger → `rebuild()` → Layer 1
  + Layer 2.
- `views/*.sql` change pushed to main → CI sync job → upsert rows in
  `_layer_2_view_defs`, then call `rebuild()` → same Layer 1 + Layer 2.

## PII tagging

A column is treated as PII if its Postgres column comment starts with
`pii`:

```sql
COMMENT ON COLUMN upchieve.users.email IS 'pii';
```

Today the only lint-accepted values are exactly `pii` and `not_pii` (see
`database/privacy/lint/check-column-pii-comments.ts`). `rebuild()` matches
the `pii` *prefix* (case-insensitively) so richer qualifiers like
`pii:phone` would also be masked, but those are not yet accepted by the
lint — don't use them in migrations until the lint allowlist is widened.

The COMMENT itself is a DDL change, so adding a `pii` tag fires the event
trigger and rebuilds analytics — masking takes effect on the next read.
Tagged columns are projected with their mask value (custom rule → blanket
rule → `NULL::<original_type>` as the safe fallback) in
`analytics._<table>`, preserving column shape and order.

## Writing hand-written views

Plain SQL. Idempotent. The CI sync stores the file contents in
`_layer_2_view_defs`; the rebuild EXECUTEs them, which is
`CREATE OR REPLACE VIEW analytics.<name> AS …`.

Override the default Layer 1 pass-through (filename = upchieve table
name):

```sql
-- views/users.sql
CREATE OR REPLACE VIEW analytics.users AS
SELECT u.*,
       split_part(pu.email, '@', 2) AS email_domain
FROM analytics._users u
JOIN upchieve.users pu ON pu.id = u.id;
```

Net-new view (filename doesn't match any upchieve table):

```sql
-- views/active_volunteers.sql
CREATE OR REPLACE VIEW analytics.active_volunteers AS
SELECT u.id, count(s.id) AS sessions_30d
FROM analytics.users u
JOIN analytics.sessions s ON s.volunteer_id = u.id
WHERE s.started_at > now() - interval '30 days'
GROUP BY u.id;
```

Hand-written views may reach into `upchieve.*` for non-PII derivations
(like `email_domain` above). There is no automated PII check on `views/*.sql`
today — reaching into `upchieve.*` bypasses Layer 1 masking, so a code
reviewer must confirm by hand that each derivation exposes only non-PII
(e.g. the email *domain*, never the address).

## Local usage

```bash
export PGHOST=localhost PGPORT=5432 \
       PGUSER=admin PGPASSWORD=Password123 \
       PGDATABASE=upchieve

# Make sure migrations have run (creates the analytics schema + roles).
pnpm run db:schema-up

cd database/analytics
./setup.sh               # installs analytics.rebuild() + tables (run once)
./sync-masking-rules.sh  # installs the real _blanket_rules() + custom rules
./sync-layer2-views.sh   # picks up any view files you edited
# or:
./apply.sh               # force a rebuild without touching Layer 2 defs
```

The local DB doesn't have the event trigger installed (it requires
superuser in production; for local dev, the rebuild is manual). Local
work flows: edit a view → `./sync-layer2-views.sh` → see the result.

## Production bootstrap

After this migration first lands on a fresh environment, an operator
must register the event trigger **once** as the database superuser
(avnadmin on Aiven). The trigger requires SUPERUSER to create, which
subway doesn't have:

```sql
CREATE EVENT TRIGGER analytics_rebuild_on_ddl
  ON ddl_command_end
  EXECUTE FUNCTION analytics.on_upchieve_ddl();
```

After that, all schema changes on `upchieve.*` auto-rebuild analytics.

The `analytics_layer2_admin` role (used by the CI sync job) also needs
a password set, once. From the Aiven console as avnadmin:

```sql
ALTER ROLE analytics_layer2_admin WITH LOGIN PASSWORD '<chosen>';
```

Store the password in GitLab CI/CD variables as
`ANALYTICS_LAYER2_PASSWORD_{STAGING,PRODUCTION}`. Hosts go in
`ANALYTICS_LAYER2_HOST_{STAGING,PRODUCTION}`.

## When a column is dropped or renamed

Layer 1 always drops and recreates every analytics view, so a dropped or
renamed `upchieve.*` column needs no special handling there — the recreated
`analytics._<table>` simply reflects the new shape. The risk is **Layer 2**:
a hand-written view in `_layer_2_view_defs` that still references the now-gone
column. When rebuild re-applies that view, the `EXECUTE` fails → the whole
rebuild transaction (and the migration that triggered it) rolls back, leaving
the prior analytics state intact. Operator sees the failed migration, updates
the affected Layer 2 view file, pushes, CI re-syncs, rebuild succeeds.

This is the dependent-view-cascade story. It's rare; the recovery is
explicit.

# Analytics environment redesign — implementation spec

> **Status: APPROVED, not yet implemented.** This spec is the agreed plan for
> reworking the analytics environment introduced in commit `e84f22f9` ("Add
> lightweight analytics environment"). It came out of a code review + a long design
> discussion; all open questions are resolved (see **Confirmed decisions**). A future
> session should implement §A–§G and verify per the checklist. Branch:
> `css-data-pr3-analytics`. The analytics migration has **never been deployed to any
> environment**, so everything is edited in place (no transition migration needed).
> An earlier `--fix` pass already landed some doc/role fixes in the working tree; this
> spec supersedes its role/ownership pieces.

## Context (why)

The shipped analytics environment has three design problems:

1. **Bootstrap knot.** `_blanket_rules()` is a function the masking CI job replaces at
   deploy time; `CREATE OR REPLACE FUNCTION` needs ownership, so `analytics_privacy_admin`
   owns it — and since that role also applies `setup.sql`, it ends up owning `rebuild()`
   too. That role has no `upchieve` read, so `rebuild()`'s `CREATE VIEW … FROM upchieve.*`
   fails and `analytics_ro` never gets `SELECT`.
2. **Layer 2 PII leak.** Hand-written `views/*.sql` can reach into raw `upchieve.*` (the
   `email_domain` example) with no enforced check.
3. **Event trigger impossible on Aiven.** `CREATE EVENT TRIGGER` requires a true superuser;
   Aiven's `avnadmin` lacks `rolsuper` and `aiven_extras` has no wrapper — so the shipped
   "avnadmin registers the event trigger" step cannot work, even as a one-time bootstrap.

## Confirmed decisions

- **Blanket rules → a derived table** (`analytics._blanket_rules`), exactly like
  `_custom_rules`. `database/privacy/01-blanket-labels.sql` is **not touched** (staging is
  first-class; analytics adapts around it).
- **`analytics_builder` is a LOGIN role** owned by the analytics project: owns
  `rebuild*()` + views/tables, sole raw-`upchieve` reader, runs `setup.sql` *as itself*
  (no `SET ROLE`, no separate setup role, no superuser). Its credential is managed in
  **Doppler and synced to GitLab CI vars** (single source of truth; GitLab Ultimate
  supports the sync). Routine ops use the narrow roles, which have no `upchieve` access.
- **Operational migrations declare only the security surface** (roles + permissions, incl.
  builder's login + `upchieve` grants). **No analytics functions/data in migrations** — the
  analytics project owns and runs its own `setup`.
- **Scheduler = a scheduled GitLab pipeline job** running the change-gated
  `analytics.rebuild_if_changed()` as `analytics_scheduler`, delineated by a `SCHEDULE_TYPE`
  variable. The global build/deploy/post-deploy jobs are scoped **positively to `push`** so
  the analytics schedule can't drag them into a deploy (MR rules untouched; a merge → push to
  `main` still deploys; only `schedule` is excluded). **Not** pg_cron (DB-side alternative
  exists but we're keeping it out of the DB / off avnadmin for now). **Not** Bull / `server/`.
- **Two sync roles kept** (only the masking pipeline can change masking).
- `apply.sh` → **`rebuild.sh`** (manual/force channel).
- **Event-trigger escape hatch:** if Aiven support ever confirms event triggers are
  possible, that's the preferred reactive design (drop the scheduler; add `on_upchieve_ddl()`
  + the trigger). The plan must not depend on it.

## Final role model

| Role | Responsibility | `upchieve` read | analytics privileges | owns | logs in | creds |
|---|---|---|---|---|---|---|
| `analytics_ro` | consumer (Retool / Slack-Claude / dashboards) | none | `USAGE` + `SELECT` on views | no | yes | consumer-side |
| `analytics_builder` *(new)* | owns `rebuild*()` + views/tables; sole raw-PII reader; runs `setup.sql` directly | `USAGE` + `SELECT` (kept current) | owner | yes | yes | Doppler → GitLab CI (synced) |
| `analytics_masking_admin` *(was `analytics_privacy_admin`)* | sync masking rules (CI) | none | DML on `_blanket_rules` + `_custom_rules`; `EXECUTE rebuild()` | no | yes | subway CI (via Doppler sync) |
| `analytics_views_admin` *(was `analytics_layer2_admin`)* | sync Layer 2 views (CI) | none | DML on `_layer_2_view_defs`; `EXECUTE rebuild()` | no | yes | subway CI |
| `analytics_scheduler` *(new)* | scheduled rebuild trigger (CI) | none | `USAGE` + `EXECUTE rebuild_if_changed()` only | no | yes | subway CI |

## Changes

### A. Roles / ownership / grants (operational migration = security surface only)
- **`database/db_init/auth.sql`**: create `analytics_builder` **WITH LOGIN** (`USAGE,CREATE`
  on `analytics`; `USAGE` on `upchieve`; `SELECT ON ALL TABLES IN SCHEMA upchieve`;
  `ALTER DEFAULT PRIVILEGES IN SCHEMA upchieve GRANT SELECT ON TABLES TO analytics_builder`
  — auth.sql runs as upchieve's owner `admin`, covering future tables, mirroring `staff_ro`).
  Repoint `analytics_ro`'s analytics default-priv grant to `analytics_builder`. Rename the
  two admin roles; drop `CREATE` from the masking role. Create `analytics_scheduler` (`USAGE`
  on `analytics` only; its `EXECUTE` grant is in setup.sql with the function).
- **`database/db_init/local_auth.sql`**: dev login passwords for `analytics_ro`,
  `analytics_builder`, `analytics_masking_admin`, `analytics_views_admin`, `analytics_scheduler`.
- **`database/migrations/20260515140600_replace_basic_access_with_analytics_schema.sql`**
  (edit in place; never deployed) — roles + permissions ONLY: create `analytics_builder`
  (LOGIN) + `upchieve` grants + default privileges; repoint `analytics_ro`'s grant; rename the
  two admin roles; drop `CREATE` from masking; create `analytics_scheduler`. *down* —
  `DROP OWNED BY`/`DROP ROLE` for `analytics_builder` and `analytics_scheduler`; rename the
  existing admin-drop blocks; keep `DROP SCHEMA analytics CASCADE` last; fix the ownership
  comment. **No analytics functions/tables in the migration.**

### B. `database/analytics/setup.sql` (run by the analytics project AS `analytics_builder`)
- Header: applied by the analytics project connecting as `analytics_builder`, so every object
  (tables, `rebuild()`, `rebuild_if_changed()`, views) is builder-owned directly. Idempotent;
  run at bootstrap + when `setup.sql` changes.
- Replace the `_blanket_rules()` **function** with a `_blanket_rules` **table**
  `(table_name, column_name, mask_value, updated_at, PRIMARY KEY (table_name, column_name))`,
  mirroring `_custom_rules`; `GRANT INSERT,UPDATE,DELETE,SELECT … TO analytics_masking_admin`.
  Prepend `DROP FUNCTION IF EXISTS analytics._blanket_rules();` (a function + table can't share
  a name across re-applies).
- `rebuild()`: change `LEFT JOIN analytics._blanket_rules() blanket` → `LEFT JOIN
  analytics._blanket_rules blanket` (drop parens). Keep the `MASKED WITH VALUE %` parsing.
- Add `analytics._schema_fingerprint(fingerprint text, updated_at timestamptz)` table +
  `analytics.rebuild_if_changed()` (see §D).
- Grants: `_layer_2_view_defs` DML → `analytics_views_admin`; `_custom_rules` DML →
  `analytics_masking_admin`; `EXECUTE rebuild()` → `analytics_views_admin, analytics_masking_admin`;
  `EXECUTE rebuild_if_changed()` → `analytics_scheduler`.
- **Delete `on_upchieve_ddl()`** (event trigger gone).
- Rewrite stale "iterates pg_attribute live / event trigger" comments → snapshot-table +
  scheduled-rebuild model.

### C. Blanket masking → table
- **`database/analytics/sync-masking-rules.ts`** (`emit()`): replace the
  `CREATE OR REPLACE FUNCTION _blanket_rules()` block with the `_custom_rules`-style pattern,
  seeded by RUNNING the extracted `BLANKET_QUERY`:
  `CREATE TEMP TABLE _desired_blanket (table_name text, column_name text, mask_value text,
  PRIMARY KEY (table_name, column_name)) ON COMMIT DROP; INSERT INTO _desired_blanket (...)
  <blanketBody>;` then UPSERT into `analytics._blanket_rules` + DELETE rows not in
  `_desired_blanket`. Replace the obsolete `$BLANKETFN$` dollar-tag guard with a check that
  `blanketBody` has no `;` (it must be one standalone catalog-only SELECT — verified: the
  marked block is a bare SELECT, no trailing `;`, reads only the catalog, so the masking role
  needs no `upchieve` data grant). Update the header docstring. **Keep `.sh`** (thin `… | psql`).
- **`database/analytics/sync-masking-rules.sh`**: comments — blanket re-derived into a table;
  grants are table DML + `EXECUTE rebuild()` (no schema `CREATE`).
- **`database/analytics/tests/smoke.sql`**: `_blanket_rules` now starts empty, so seed the
  expected `users.email` blanket row before the first rebuild (NULL nullable / `''` NOT NULL
  text) so the test still exercises a real blanket row.
- Document snapshot semantics: blanket is re-derived each masking sync; a newly pii-tagged
  column masks to `NULL` (safe) until the next masking sync or next schema-change rebuild.

### D. Remove event trigger; scheduled change-gated rebuild via GitLab cron
- **`analytics.rebuild_if_changed()`** in `setup.sql` (SECURITY DEFINER, owned by
  `analytics_builder`): compute `md5(string_agg(...))` over `(relname, attname,
  format_type(atttypid,atttypmod), attnotnull, coalesce(description,''))` for ordinary
  `upchieve` tables, deterministically ordered; compare to the row in
  `analytics._schema_fingerprint`; if different, `PERFORM analytics.rebuild()` and update it.
  Catalog-only read; the lock-taking drop/recreate happens only on real schema changes.
- **Scheduler job** in `database/analytics/.gitlab-ci.yml`: `analytics_scheduled_rebuild`
  (image `postgres:15-alpine`), `PGUSER: analytics_scheduler`, runs
  `psql --set ON_ERROR_STOP=on -c 'SELECT analytics.rebuild_if_changed();'`. Gate:
  `rules: - if: $CI_PIPELINE_SOURCE == "schedule" && $SCHEDULE_TYPE == "analytics_rebuild"`.
  The cron + `SCHEDULE_TYPE=analytics_rebuild` is a one-time GitLab → Pipeline-schedules entry
  (target `main`).
- **Global-pipeline gate (CONFIRMED):** scope the **default-branch rule of the
  build/deploy/post-deploy jobs** in the root `.gitlab-ci.yml` to pushes —
  `if: $CI_PIPELINE_SOURCE == "push" && $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH`. Leave the
  `merge_request_event` rules untouched (MR pipelines unaffected; a merge → push to `main`
  still deploys; only `schedule` is excluded). Confirm the exact per-job rule expressions
  against the real deploy/merge triggers when implementing. (test/lint may be push-scoped too
  for tidiness; harmless if left.)
- **CI sync jobs keep calling `rebuild()` directly** (immediate apply on deploy); only the
  scheduler uses gated `rebuild_if_changed()`. `rebuild.sh` calls `rebuild()`.
- Tradeoff: rebuild is *eventual* (≤ schedule cadence; GitLab ~hourly-granular) — fine for a
  downstream read-only mirror and rare schema changes.
- **`README.md` "Production bootstrap"**: delete the `CREATE EVENT TRIGGER` step; document the
  scheduled rebuild job + the one-time Pipeline-schedule entry.

### E. Close the Layer 2 hole
- **`database/analytics/sync-layer2-views.sh`**: in the per-file validation loop, reject any
  `views/*.sql` referencing `upchieve` as a schema qualifier:
  `grep -Eniq '(^|[^a-z0-9_])upchieve"?[[:space:]]*\.'` (matches `upchieve.x` / `"upchieve".x`;
  NOT `analytics.sponsor_orgs_upchieve_instances`). Add a header note.
- **`database/analytics/views/users.sql`**: replace the `email_domain`-from-raw override with a
  masked-only override reading only `analytics._users`, deriving a non-PII column (e.g.
  `account_age_days` from non-PII `created_at`). Keeps the dir + CI `changes:` glob alive.
- **`database/privacy/02-custom-labels.sql`**: add a *commented* example of the sanctioned
  in-place derive-from-PII via `MASKED WITH FUNCTION` (e.g. `split_part(email,'@',2)`).
- **`tests/smoke.sql` step 6**: rewrite to the masked-only override; keep the assertion that
  email stays masked.
- **`README.md`**: document the "no `upchieve` in `views/*.sql`" rule.

### F. Rename apply.sh → rebuild.sh; CI changes
- **Rename `database/analytics/apply.sh` → `database/analytics/rebuild.sh`** (manual force
  channel). Update references in `database/analytics/test.sh`, `README.md`, and its header.
- **`database/analytics/.gitlab-ci.yml`**:
  - **Keep the `.analytics_setup` jobs**, run as `PGUSER: analytics_builder` (creds via
    Doppler→GitLab). Programmatic on `main` (staging auto, prod manual), gated by
    `changes: [database/analytics/setup.sql]`; re-applies idempotently when it changes; prod
    manual triggers the deliberate first bootstrap. Push-scoped so the analytics schedule never
    triggers them. (`setup.sql` is the analytics project's own state — not in the operational
    migration.)
  - `.sync_analytics_layer2_views` → `PGUSER: analytics_views_admin` (`ANALYTICS_LAYER2_*` →
    `ANALYTICS_VIEWS_*`); `.sync_masking_rules` → `PGUSER: analytics_masking_admin`
    (`ANALYTICS_PRIVACY_*` → `ANALYTICS_MASKING_*`). Keep their push/MR triggers.
  - Add `analytics_scheduled_rebuild` (`PGUSER: analytics_scheduler`, `ANALYTICS_SCHEDULER_*`
    vars, `SCHEDULE_TYPE` rule).
  - Update header comments + `_blanket_rules` (table, not function).
- **`database/analytics/setup.sh`**: header documents it runs as `analytics_builder`; update
  run order (no event-trigger step); note it's bootstrap/rare.

### G. Privacy role-guard rename
- **`database/privacy/01-blanket-labels.sql`** + **`02-custom-labels.sql`** role guards:
  `analytics_privacy_admin` → `analytics_masking_admin` (CONFIRMED — this single guard-role-name
  line is the only change to `01-blanket-labels.sql`; its `BLANKET_QUERY` + staging path are
  untouched). The guard must accept the renamed role so the masking sync / staging clone can
  still apply labels.

## Bootstrap sequence (no event trigger, no anon, no runtime superuser)
1. Operator applies dbmate migrations → analytics schema + 5 roles + grants (security surface
   only; no analytics functions).
2. All analytics role creds (`analytics_ro`, `analytics_builder`, `analytics_masking_admin`,
   `analytics_views_admin`, `analytics_scheduler`) live in **Doppler**, synced to subway GitLab
   CI vars via Doppler's GitLab Sync Integration (Ultimate ✓).
3. The **`.analytics_setup` CI job** runs `setup.sh` **as `analytics_builder`** (programmatically)
   → installs tables + `rebuild()` + `rebuild_if_changed()` + `_schema_fingerprint`,
   builder-owned. Re-applies when `setup.sql` changes (prod manual for first bootstrap). Dev:
   wire into the local db bootstrap.
4. `sync-masking-rules.sh` (`analytics_masking_admin`) + `sync-layer2-views.sh`
   (`analytics_views_admin`).
5. Create the GitLab Pipeline schedule (cron, target `main`, `SCHEDULE_TYPE=analytics_rebuild`)
   for `analytics_scheduled_rebuild`. Then schema changes auto-rebuild within the schedule
   cadence — no DB-side, app, or `avnadmin` step.

## Verification (local)
1. `pnpm run db:reset-schema` + `db:schema-up`.
2. As `analytics_builder` (Password123), run `setup.sh`, `sync-masking-rules.sh`,
   `sync-layer2-views.sh`.
3. Views builder-owned: `SELECT relname, relowner::regrole FROM pg_class … WHERE relkind='v'
   AND nspname='analytics'` → `analytics_builder`.
4. Consumer reads, PII masked: tag `upchieve.users.email` pii; `rebuild.sh`; as `analytics_ro`
   `SELECT email FROM analytics.users` → NULL/'' (not raw).
5. Role boundaries: as `analytics_scheduler` / each sync role, `SELECT 1 FROM upchieve.users`
   → permission denied; `analytics_scheduler SELECT analytics.rebuild_if_changed()` succeeds
   (SECURITY DEFINER); sync roles `SELECT analytics.rebuild()` succeed.
6. Change-gated rebuild: `rebuild_if_changed()` twice with no schema change → second is a no-op;
   then `COMMENT ON COLUMN upchieve.users.phone IS 'pii'` → rebuilds, `analytics._users.phone` masked.
7. CI wiring (static): `analytics_scheduled_rebuild` gated on `$CI_PIPELINE_SOURCE == "schedule"
   && $SCHEDULE_TYPE == "analytics_rebuild"`; global build/deploy jobs scoped to `push`;
   `.analytics_setup` runs as `analytics_builder`, push-scoped + `changes:[setup.sql]`.
8. Layer 2 guard: a `views/*.sql` containing `upchieve.foo` is rejected by the sync.
9. `./test.sh` (full smoke, ROLLBACKs) passes with the `_blanket_rules` seed + masked-only step 6.

## Files explicitly NOT changed
- `database/privacy/01-blanket-labels.sql` — `BLANKET_QUERY` + staging path untouched (only the
  guard role name per §G).
- `server/**` — fully untouched. No analytics job/logic or scheduler lives in `server/`.

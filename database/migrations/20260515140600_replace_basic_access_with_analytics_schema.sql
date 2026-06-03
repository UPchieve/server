-- migrate:up
-- 1. Drop the old basic_access schema (with its views) and role.
--    Wrapped in a DO block so re-running against a DB where the role was
--    never created (fresh local dev with updated auth.sql) succeeds.
DROP SCHEMA IF EXISTS basic_access CASCADE;

DO $$
BEGIN
    IF EXISTS (
        SELECT
            1
        FROM
            pg_roles
        WHERE
            rolname = 'basic_access') THEN
    EXECUTE 'DROP OWNED BY basic_access CASCADE';
    EXECUTE 'DROP ROLE basic_access';
END IF;
END
$$;

-- 2. Create the analytics schema. (Tables and functions are installed
--    separately by database/analytics/setup.sql via setup.sh.)
CREATE SCHEMA IF NOT EXISTS analytics;

GRANT CREATE ON SCHEMA analytics TO subway;

GRANT USAGE ON SCHEMA analytics TO subway;

-- 3. Create analytics_ro — read-only consumer role used by team Claude,
--    Slack Claude, Retool dashboards, etc. No grants on upchieve; staff
--    who need PII use the existing staff_ro role.
CREATE ROLE analytics_ro;

GRANT USAGE ON SCHEMA analytics TO analytics_ro;

GRANT SELECT ON ALL TABLES IN SCHEMA analytics TO analytics_ro;

ALTER ROLE analytics_ro SET search_path = analytics;

-- This DEFAULT PRIVILEGES rule only fires for views OWNED BY subway. Since
-- analytics.rebuild() is SECURITY DEFINER, its views are owned by whoever owns
-- the function -- so rebuild() must be owned by subway for analytics_ro to get
-- SELECT automatically (see database/analytics/setup.sql). apply.sh also runs a
-- belt-and-suspenders GRANT for the manual/recovery path.
ALTER DEFAULT PRIVILEGES FOR ROLE subway IN SCHEMA analytics GRANT
SELECT
    ON TABLES TO analytics_ro;

-- 4. Operational safety knobs (per the lightweight-analytics plan).
ALTER ROLE analytics_ro SET statement_timeout = '60s';

ALTER ROLE analytics_ro SET idle_in_transaction_session_timeout = '30s';

-- 5. analytics_layer2_admin — narrow-scope role used by the
--    sync_analytics_layer2_views CI job. Can edit Layer 2 view definitions
--    and call analytics.rebuild(); cannot touch upchieve.* or any other
--    analytics object. Table-specific grants on analytics._layer_2_view_defs
--    live alongside the table definition in database/analytics/setup.sql.
DO $$
BEGIN
    CREATE ROLE analytics_layer2_admin;
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

GRANT USAGE ON SCHEMA analytics TO analytics_layer2_admin;

-- 6. analytics_privacy_admin — used by the sync_masking_rules CI job to
--    reinstall analytics._blanket_rules() and upsert analytics._custom_rules
--    from database/privacy/*.sql. Needs CREATE on the analytics schema so
--    sync-masking-rules.ts can replace the _blanket_rules function. Table-
--    specific grants live alongside the table definitions in
--    database/analytics/setup.sql.
DO $$
BEGIN
    CREATE ROLE analytics_privacy_admin;
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

GRANT USAGE, CREATE ON SCHEMA analytics TO analytics_privacy_admin;

-- migrate:down
-- Restore basic_access structurally. The views, the JSON allowlist, the TS
-- regen script, and the worker-job entry are NOT restored — recover those
-- from git history if a true rollback is needed:
--   database/db_init/upchieve_basic_access.json
--   server/scripts/update-basic-access-views.ts
--   server/worker/jobs/index.ts (basic_access entries)
DO $$
BEGIN
    IF EXISTS (
        SELECT
            1
        FROM
            pg_roles
        WHERE
            rolname = 'analytics_privacy_admin') THEN
    EXECUTE 'DROP OWNED BY analytics_privacy_admin CASCADE';
    EXECUTE 'DROP ROLE analytics_privacy_admin';
END IF;
END
$$;

DO $$
BEGIN
    IF EXISTS (
        SELECT
            1
        FROM
            pg_roles
        WHERE
            rolname = 'analytics_layer2_admin') THEN
    EXECUTE 'DROP OWNED BY analytics_layer2_admin CASCADE';
    EXECUTE 'DROP ROLE analytics_layer2_admin';
END IF;
END
$$;

DO $$
BEGIN
    IF EXISTS (
        SELECT
            1
        FROM
            pg_roles
        WHERE
            rolname = 'analytics_ro') THEN
    EXECUTE 'DROP OWNED BY analytics_ro CASCADE';
    EXECUTE 'DROP ROLE analytics_ro';
END IF;
END
$$;

DROP SCHEMA IF EXISTS analytics CASCADE;

CREATE ROLE basic_access;

CREATE SCHEMA IF NOT EXISTS basic_access;

GRANT SELECT ON ALL TABLES IN SCHEMA basic_access TO basic_access;

GRANT USAGE ON SCHEMA basic_access TO basic_access;

ALTER ROLE basic_access SET search_path = basic_access;

ALTER DEFAULT PRIVILEGES IN SCHEMA basic_access GRANT
SELECT
    ON TABLES TO basic_access;

GRANT CREATE ON SCHEMA basic_access TO subway;

GRANT USAGE ON SCHEMA basic_access TO subway;

ALTER DEFAULT PRIVILEGES FOR ROLE subway IN SCHEMA basic_access GRANT
SELECT
    ON TABLES TO basic_access;


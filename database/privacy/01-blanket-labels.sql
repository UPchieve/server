-- ============================================================================
-- 01-blanket-labels.sql — type-aware blanket for every pii column.
-- ============================================================================
-- Run by:
--   * staging on its clone DB, before `anon.anonymize_database()`:
--       psql -c "SET search_path = upchieve, public;" -f 01-blanket-labels.sql
--   * analytics: NOT executed directly. database/analytics/sync-masking-rules.sh
--     extracts the BLANKET_QUERY block below and reinstalls it as the body
--     of analytics._blanket_rules(); analytics.rebuild() then projects views
--     from that function's output.
--
-- pg_description on upchieve.* is the source of truth for which columns are
-- pii. This file reads that metadata; it writes SECURITY LABELs targeting
-- the LEADING schema in search_path (upchieve in staging — analytics never
-- writes labels). Type-aware so staging's NOT NULL columns get non-NULL
-- defaults.
--
-- !!! Do not move or rename the BLANKET_QUERY_BEGIN / BLANKET_QUERY_END
-- marker comments — analytics's sync depends on them.

-- Role guard: only dedicated roles may apply these masking labels. Without
-- this, an app role (e.g. subway) could run this file directly on production.
-- Membership-based checks (pg_has_role) error on roles that don't exist yet,
-- so we match current_user by name; the dedicated roles are created later.
DO $$
BEGIN
    IF NOT (
        (SELECT rolsuper FROM pg_roles WHERE rolname = current_user)
        OR current_user IN ('analytics_privacy_admin', 'staging_clone')
    ) THEN
        RAISE EXCEPTION
            'privacy masking labels may only be applied by a dedicated role (superuser, analytics_privacy_admin, or the staging-clone role); current_user = %',
            current_user;
    END IF;
END $$;

DO $$
DECLARE
    r          record;
BEGIN
    IF current_schema() <> 'upchieve' THEN
        RAISE EXCEPTION
            'set search_path = upchieve, public before running this file; current_schema() = %',
            current_schema();
    END IF;

    -- 1. Clear stale anon labels (columns no longer pii on upchieve).
    FOR r IN
        SELECT
            c.relname AS table_name,
            a.attname AS column_name
        FROM
            pg_attribute   a
            JOIN pg_class       c  ON a.attrelid     = c.oid
            JOIN pg_namespace   n  ON c.relnamespace = n.oid
            JOIN pg_seclabel    sl ON sl.objoid = c.oid
                                  AND sl.objsubid = a.attnum
                                  AND sl.provider = 'anon'
            LEFT JOIN pg_description pd ON pd.objoid = c.oid AND pd.objsubid = a.attnum
        WHERE
            n.nspname = 'upchieve'
            AND (pd.description IS NULL OR pd.description <> 'pii')
    LOOP
        EXECUTE format(
            'SECURITY LABEL FOR anon ON COLUMN %I.%I IS NULL',
            r.table_name, r.column_name);
    END LOOP;

    -- 2. (Re-)apply the type-aware blanket for every pii column.
    FOR r IN
        -- BLANKET_QUERY_BEGIN
        SELECT
            pc.relname AS table_name,
            pa.attname AS column_name,
            CASE
                WHEN NOT pa.attnotnull
                    THEN 'MASKED WITH VALUE NULL'
                WHEN format_type(pa.atttypid, NULL) IN
                    ('text', 'character varying', 'character', 'citext')
                    THEN 'MASKED WITH VALUE '''''
                WHEN format_type(pa.atttypid, NULL) IN
                    ('integer', 'bigint', 'smallint', 'numeric',
                     'real', 'double precision')
                    THEN 'MASKED WITH VALUE 0'
                WHEN format_type(pa.atttypid, NULL) LIKE 'timestamp%'
                    OR format_type(pa.atttypid, NULL) = 'date'
                    THEN 'MASKED WITH VALUE ''epoch'''
                WHEN format_type(pa.atttypid, NULL) = 'boolean'
                    THEN 'MASKED WITH VALUE FALSE'
                WHEN format_type(pa.atttypid, NULL) = 'uuid'
                    THEN 'MASKED WITH VALUE ''00000000-0000-0000-0000-000000000000'''
                WHEN format_type(pa.atttypid, NULL) = 'jsonb'
                    THEN 'MASKED WITH VALUE ''{}'''
                ELSE
                    'MASKED WITH VALUE NULL'
            END AS mask_value
        FROM
            pg_attribute pa
            JOIN pg_class       pc ON pa.attrelid    = pc.oid
            JOIN pg_namespace   pn ON pc.relnamespace = pn.oid
            LEFT JOIN pg_description pd ON pd.objoid = pc.oid AND pd.objsubid = pa.attnum
        WHERE
            pn.nspname     = 'upchieve'
            AND pc.relkind = 'r'
            AND pa.attnum  > 0
            AND NOT pa.attisdropped
            AND pd.description = 'pii'
        -- BLANKET_QUERY_END
    LOOP
        EXECUTE format(
            'SECURITY LABEL FOR anon ON COLUMN %I.%I IS %L',
            r.table_name, r.column_name, r.mask_value);
    END LOOP;
END $$;

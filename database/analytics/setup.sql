-- ============================================================================
-- database/analytics/setup.sql — idempotent analytics tables + functions.
-- ============================================================================
-- Applied by database/analytics/setup.sh as analytics_privacy_admin. Run once per
-- environment after the role-creation migration (20260515140600_…). Safe
-- to re-run.
--
-- Roles, schema, schema-level grants, and DEFAULT PRIVILEGES live in
-- database/migrations/20260515140600_replace_basic_access_with_analytics_schema.sql.
--
-- Superuser-only steps (anon extension, REVOKEs, event trigger registration)
-- live in the manual avnadmin bootstrap — see README.md "Production bootstrap".

-- ============================================================================
-- analytics._layer_2_view_defs — Layer 2 view source-of-truth.
-- ============================================================================
-- Hand-written analytics views live in database/analytics/views/*.sql. The
-- sync_analytics_layer2_views CI job UPSERTs each file's contents into this
-- table on push to main (production is manual). analytics.rebuild() iterates
-- this table at the end of every rebuild and EXECUTEs each row's sql.
CREATE TABLE IF NOT EXISTS analytics._layer_2_view_defs (
    name       text PRIMARY KEY,
    sql        text NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT, UPDATE, DELETE, SELECT
    ON analytics._layer_2_view_defs TO analytics_layer2_admin;

-- ============================================================================
-- analytics._custom_rules — hand-curated mask overrides.
-- ============================================================================
-- Populated by database/analytics/sync-masking-rules.sh from
-- database/privacy/02-custom-labels.sql. One row per overridden column.
-- mask_value carries the raw anon label expression (e.g. "MASKED WITH
-- FUNCTION anon.partial_email(email)"); analytics.rebuild() inlines it into
-- the projected view.
CREATE TABLE IF NOT EXISTS analytics._custom_rules (
    table_name  text NOT NULL,
    column_name text NOT NULL,
    mask_value  text NOT NULL,
    updated_at  timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (table_name, column_name)
);

GRANT INSERT, UPDATE, DELETE, SELECT
    ON analytics._custom_rules TO analytics_privacy_admin;

-- ============================================================================
-- analytics._blanket_rules() — placeholder.
-- ============================================================================
-- The real body is reinstalled by database/analytics/sync-masking-rules.sh, which
-- extracts the SELECT between -- BLANKET_QUERY_BEGIN / -- BLANKET_QUERY_END
-- markers in database/privacy/01-blanket-labels.sql.
--
-- The placeholder returns zero rows so rebuild() works pre-first-sync:
-- pii columns fall through to the safe NULL fallback in the projection.
CREATE OR REPLACE FUNCTION analytics._blanket_rules ()
    RETURNS TABLE (
        table_name  text,
        column_name text,
        mask_value  text
    )
    LANGUAGE sql
    STABLE
AS $$
    SELECT NULL::text, NULL::text, NULL::text WHERE FALSE;
$$;

GRANT EXECUTE ON FUNCTION analytics._blanket_rules ()
    TO subway, analytics_privacy_admin, analytics_layer2_admin;

-- ============================================================================
-- analytics.rebuild() — Layer 1 + Layer 2 in one transaction.
-- ============================================================================
-- Always-rebuild: drop every view in analytics, then create everything from
-- scratch. Layer 2 always gets re-applied from _layer_2_view_defs at the
-- end, so there's no need to preserve dependent views during the Layer 1
-- step.
--
-- Layer 1 projection per column:
--   * not_pii / unlabeled column-comment              → passthrough
--   * pii + matching analytics._custom_rules row      → apply override
--       - MASKED WITH VALUE <expr>                    → (<expr>)::<type>
--       - MASKED WITH FUNCTION <expr>                 → <expr>
--       - other                                       → NULL::<type>
--   * pii + matching analytics._blanket_rules row     → blanket value
--   * pii + nothing yet                               → NULL::<type>
--
-- Because _blanket_rules() iterates pg_attribute live, a new pii column
-- added by DDL is masked the next time rebuild() runs — which the
-- analytics_rebuild_on_ddl event trigger fires in the migration's
-- transaction.
CREATE OR REPLACE FUNCTION analytics.rebuild ()
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
    vrow   record;
    tbl    record;
    col    record;
    layer2 record;
    cols   text;
BEGIN
    -- 1. Drop existing analytics views.
    FOR vrow IN
        SELECT
            table_name
        FROM
            information_schema.views
        WHERE
            table_schema = 'analytics'
    LOOP
        EXECUTE format('DROP VIEW IF EXISTS analytics.%I CASCADE', vrow.table_name);
    END LOOP;

    -- 2. Layer 1: project each upchieve table into analytics._<table>
    --    (and analytics.<table> unless Layer 2 will define it).
    FOR tbl IN
        SELECT
            pc.relname AS table_name,
            pc.oid     AS table_oid
        FROM
            pg_class      pc
            JOIN pg_namespace pn ON pn.oid = pc.relnamespace
        WHERE
            pn.nspname = 'upchieve'
            AND pc.relkind = 'r'
        ORDER BY
            pc.relname
    LOOP
        cols := '';
        FOR col IN
            SELECT
                pa.attname                              AS column_name,
                format_type(pa.atttypid, pa.atttypmod)  AS column_type,
                coalesce(pd.description, '')            AS column_comment,
                custom.mask_value                       AS custom_mask,
                blanket.mask_value                      AS blanket_mask
            FROM
                pg_attribute pa
                LEFT JOIN pg_description pd
                    ON pd.objoid = tbl.table_oid
                    AND pd.objsubid = pa.attnum
                LEFT JOIN analytics._custom_rules custom
                    ON custom.table_name = tbl.table_name
                    AND custom.column_name = pa.attname
                LEFT JOIN analytics._blanket_rules() blanket
                    ON blanket.table_name = tbl.table_name
                    AND blanket.column_name = pa.attname
            WHERE
                pa.attrelid = tbl.table_oid
                AND pa.attnum > 0
                AND NOT pa.attisdropped
            ORDER BY
                pa.attnum
        LOOP
            IF cols <> '' THEN
                cols := cols || ', ';
            END IF;

            -- Case-insensitive: the pii-comment lint enforces lower-case
            -- 'pii'/'not_pii' in migrations, but the event trigger also fires
            -- on manual psql DDL (see README), where a stray 'PII' / 'Pii'
            -- would otherwise pass through UNMASKED. Masking more is always
            -- the safe direction here.
            IF lower(col.column_comment) NOT LIKE 'pii%' THEN
                -- not_pii / unlabeled: passthrough.
                cols := cols || format('%I', col.column_name);
            ELSIF col.custom_mask IS NOT NULL THEN
                IF col.custom_mask LIKE 'MASKED WITH VALUE %' THEN
                    cols := cols || format(
                        '(%s)::%s AS %I',
                        substring(col.custom_mask FROM 'MASKED WITH VALUE (.*)$'),
                        col.column_type,
                        col.column_name);
                ELSIF col.custom_mask LIKE 'MASKED WITH FUNCTION %' THEN
                    cols := cols || format(
                        '%s AS %I',
                        substring(col.custom_mask FROM 'MASKED WITH FUNCTION (.*)$'),
                        col.column_name);
                ELSE
                    cols := cols || format('NULL::%s AS %I', col.column_type, col.column_name);
                END IF;
            ELSIF col.blanket_mask IS NOT NULL AND col.blanket_mask LIKE 'MASKED WITH VALUE %' THEN
                cols := cols || format(
                    '(%s)::%s AS %I',
                    substring(col.blanket_mask FROM 'MASKED WITH VALUE (.*)$'),
                    col.column_type,
                    col.column_name);
            ELSE
                -- pii but no rule yet (placeholder _blanket_rules, or sync
                -- hasn't installed the real body): NULL is the safe fallback.
                cols := cols || format('NULL::%s AS %I', col.column_type, col.column_name);
            END IF;
        END LOOP;

        EXECUTE format(
            'CREATE VIEW analytics.%I AS SELECT %s FROM upchieve.%I',
            '_' || tbl.table_name,
            cols,
            tbl.table_name);

        IF NOT EXISTS (
            SELECT 1 FROM analytics._layer_2_view_defs WHERE name = tbl.table_name
        ) THEN
            EXECUTE format(
                'CREATE VIEW analytics.%I AS SELECT * FROM analytics.%I',
                tbl.table_name,
                '_' || tbl.table_name);
        END IF;
    END LOOP;

    -- 3. Layer 2.
    FOR layer2 IN
        SELECT
            name,
            sql
        FROM
            analytics._layer_2_view_defs
        ORDER BY
            name
    LOOP
        EXECUTE layer2.sql;
    END LOOP;
END
$$;

GRANT EXECUTE ON FUNCTION analytics.rebuild ()
    TO subway, analytics_layer2_admin, analytics_privacy_admin;

-- ============================================================================
-- analytics.on_upchieve_ddl() — event-trigger function.
-- ============================================================================
-- Fires on every DDL command end. Checks whether the command touched
-- upchieve.* and calls rebuild() if so. The trigger fires again on
-- rebuild()'s own analytics.* DDL, but the schema check short-circuits —
-- no recursion. The trigger itself is registered manually by avnadmin
-- (CREATE EVENT TRIGGER requires SUPERUSER); see README.md "Production bootstrap".
CREATE OR REPLACE FUNCTION analytics.on_upchieve_ddl ()
    RETURNS event_trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
    affects_upchieve boolean;
BEGIN
    SELECT
        EXISTS (
            SELECT
                1
            FROM
                pg_event_trigger_ddl_commands ()
            WHERE
                schema_name = 'upchieve'
                OR object_identity LIKE 'upchieve.%') INTO affects_upchieve;
    IF affects_upchieve THEN
        PERFORM
            analytics.rebuild ();
    END IF;
END
$$;

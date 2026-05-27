-- ============================================================================
-- 02-custom-labels.sql — hand-curated overrides on top of the blanket.
-- ============================================================================
-- Run by:
--   * staging on its clone DB, after 01-blanket-labels.sql:
--       psql -c "SET search_path = upchieve, public;" -f 02-custom-labels.sql
--   * analytics: NOT executed directly. database/analytics/sync-masking-rules.sh
--     uses pgsql-parser to find each SecLabelStmt and upserts
--     (table_name, column_name, mask_value) tuples into analytics._custom_rules.
--
-- Pattern:
--   SECURITY LABEL FOR anon ON COLUMN <table>.<column> IS '<rule>';
--
-- The table reference is 2-part (table.column, no schema). For staging,
-- the leading entry of search_path (upchieve) resolves it. For analytics,
-- the sync parses the raw text and stores (table, column) verbatim.
--
-- These statements execute AFTER 01-blanket-labels.sql, so each one
-- overwrites the type-aware blanket label for that specific column.

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
BEGIN
    IF current_schema() <> 'upchieve' THEN
        RAISE EXCEPTION
            'set search_path = upchieve, public before running this file; current_schema() = %',
            current_schema();
    END IF;
END $$;

-- Add overrides below. Examples (uncomment and adapt):
--
-- SECURITY LABEL FOR anon ON COLUMN users.email
--     IS 'MASKED WITH FUNCTION anon.partial_email(email)';
--
-- SECURITY LABEL FOR anon ON COLUMN users.first_name
--     IS 'MASKED WITH FUNCTION anon.fake_first_name()';

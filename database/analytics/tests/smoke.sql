-- Smoke test for the analytics rebuild + masking pipeline (v11).
-- Wraps everything in a transaction with ROLLBACK at the end, so the DB
-- is left untouched (no leftover PII tags, no leftover views, no leftover
-- rows). Assumes the pipeline is fully installed: database/analytics/setup.sh +
-- database/analytics/sync-masking-rules.sh have run.

\set ON_ERROR_STOP on
\echo === analytics smoke test ===

SET client_min_messages = WARNING;

BEGIN;

-- Clear Layer 2 overrides so the parity assertions below test the pure
-- auto-generated passthrough. Inside the transaction, restored on ROLLBACK.
DELETE FROM analytics._layer_2_view_defs;

-- Tag a representative column as PII, then rebuild so the test runs against
-- a view that includes at least one masked column. The blanket function
-- iterates pg_attribute live, so the new pii tag is picked up.
COMMENT ON COLUMN upchieve.users.email IS 'pii';
SELECT analytics.rebuild();

-- 1. Every upchieve ordinary table has a corresponding analytics.<table>.
DO $$
DECLARE
  missing int;
BEGIN
  SELECT count(*) INTO missing
  FROM pg_class pc
  JOIN pg_namespace pn ON pn.oid = pc.relnamespace
  WHERE pn.nspname = 'upchieve' AND pc.relkind = 'r'
    AND NOT EXISTS (
      SELECT 1 FROM pg_class pcv
      JOIN pg_namespace pnv ON pnv.oid = pcv.relnamespace
      WHERE pnv.nspname = 'analytics' AND pcv.relname = pc.relname
    );
  ASSERT missing = 0, format('%s upchieve tables missing public analytics view', missing);
END $$;

-- 2. Every upchieve ordinary table has a corresponding analytics._<table>.
DO $$
DECLARE
  missing int;
BEGIN
  SELECT count(*) INTO missing
  FROM pg_class pc
  JOIN pg_namespace pn ON pn.oid = pc.relnamespace
  WHERE pn.nspname = 'upchieve' AND pc.relkind = 'r'
    AND NOT EXISTS (
      SELECT 1 FROM pg_class pcv
      JOIN pg_namespace pnv ON pnv.oid = pcv.relnamespace
      WHERE pnv.nspname = 'analytics' AND pcv.relname = '_' || pc.relname
    );
  ASSERT missing = 0, format('%s upchieve tables missing internal _<table> view', missing);
END $$;

-- 3. Column-shape parity for upchieve.users vs analytics.users (same count,
--    same names, same ordinal positions).
DO $$
DECLARE
  u_count int;
  a_count int;
  diffs   int;
BEGIN
  SELECT count(*) INTO u_count FROM information_schema.columns
   WHERE table_schema = 'upchieve' AND table_name = 'users';
  SELECT count(*) INTO a_count FROM information_schema.columns
   WHERE table_schema = 'analytics' AND table_name = 'users';
  ASSERT u_count = a_count,
    format('column count mismatch: upchieve.users=%s analytics.users=%s', u_count, a_count);

  SELECT count(*) INTO diffs
  FROM (
    SELECT column_name, ordinal_position FROM information_schema.columns
     WHERE table_schema = 'upchieve' AND table_name = 'users'
  ) u
  FULL OUTER JOIN (
    SELECT column_name, ordinal_position FROM information_schema.columns
     WHERE table_schema = 'analytics' AND table_name = 'users'
  ) a USING (column_name, ordinal_position)
  WHERE u.column_name IS NULL OR a.column_name IS NULL;
  ASSERT diffs = 0,
    format('column-shape parity broken: %s positional/name diffs', diffs);
END $$;

-- 4. Blanket masking: a PII-tagged column reads as raw value via upchieve.*
--    and as the type-aware blanket value (NULL for nullable, '' for NOT NULL
--    text, etc.) via both analytics.<table> and analytics._<table>.
INSERT INTO upchieve.users (id, email, first_name, last_name, referral_code, test_user, created_at, updated_at)
VALUES (gen_random_uuid(), 'leak@example.com', 'A', 'B', 'ANALYTICSSMOKE', true, now(), now());

DO $$
DECLARE
  raw_email          text;
  public_email       text;
  internal_email     text;
  email_is_nullable  boolean;
  expected_masked    text;
BEGIN
  SELECT is_nullable = 'YES' INTO email_is_nullable
  FROM information_schema.columns
  WHERE table_schema = 'upchieve' AND table_name = 'users' AND column_name = 'email';

  -- Blanket: nullable text → NULL, NOT NULL text → ''.
  expected_masked := CASE WHEN email_is_nullable THEN NULL ELSE '' END;

  SELECT email INTO raw_email      FROM upchieve.users   WHERE referral_code = 'ANALYTICSSMOKE';
  SELECT email INTO public_email   FROM analytics.users  WHERE referral_code = 'ANALYTICSSMOKE';
  SELECT email INTO internal_email FROM analytics._users WHERE referral_code = 'ANALYTICSSMOKE';

  ASSERT raw_email = 'leak@example.com',
    format('upchieve.users.email should be raw, got %L', raw_email);
  ASSERT public_email IS NOT DISTINCT FROM expected_masked,
    format('analytics.users.email should be %L (blanket), got %L', expected_masked, public_email);
  ASSERT internal_email IS NOT DISTINCT FROM expected_masked,
    format('analytics._users.email should be %L (blanket), got %L', expected_masked, internal_email);
END $$;

-- 5. Custom override: stash a fake override in _custom_rules and confirm
--    rebuild() applies it on top of the blanket. Both writes are inside the
--    transaction, so ROLLBACK reverts them.
INSERT INTO analytics._custom_rules (table_name, column_name, mask_value)
VALUES ('users', 'email', 'MASKED WITH VALUE ''masked@example.com''')
ON CONFLICT (table_name, column_name) DO UPDATE
  SET mask_value = EXCLUDED.mask_value;
SELECT analytics.rebuild();

DO $$
DECLARE
  overridden_public   text;
  overridden_internal text;
BEGIN
  SELECT email INTO overridden_public   FROM analytics.users  WHERE referral_code = 'ANALYTICSSMOKE';
  SELECT email INTO overridden_internal FROM analytics._users WHERE referral_code = 'ANALYTICSSMOKE';

  ASSERT overridden_public = 'masked@example.com',
    format('analytics.users.email should be the override value, got %L', overridden_public);
  ASSERT overridden_internal = 'masked@example.com',
    format('analytics._users.email should be the override value, got %L', overridden_internal);
END $$;

-- 6. Layer 2 override: a hand-written view replaces the default pass-through
--    and exposes a derived non-PII column without leaking the PII source.
CREATE OR REPLACE VIEW analytics.users AS
SELECT u.*,
       split_part(pu.email, '@', 2) AS email_domain
FROM analytics._users u
JOIN upchieve.users pu ON pu.id = u.id;

DO $$
DECLARE
  domain_val       text;
  still_masked_val text;
BEGIN
  SELECT email_domain INTO domain_val       FROM analytics.users WHERE referral_code = 'ANALYTICSSMOKE';
  SELECT email        INTO still_masked_val FROM analytics.users WHERE referral_code = 'ANALYTICSSMOKE';

  ASSERT domain_val = 'example.com',
    format('override email_domain should be example.com, got %L', domain_val);
  ASSERT still_masked_val = 'masked@example.com',
    format('Layer 2 override should not unmask email (still want custom value), got %L', still_masked_val);
END $$;

ROLLBACK;

\echo === smoke test passed ===

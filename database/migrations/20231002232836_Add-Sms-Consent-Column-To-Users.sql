-- migrate:up
-- The one-time backfill UPDATE of existing users' sms_consent was removed here so
-- this migration is DDL-only and safe to run on logical-replication subscribers.
-- The backfill was a no-op on a from-empty build (no users exist yet, and new rows
-- get the DEFAULT FALSE below), so it was not recreated as a seed-update.
ALTER TABLE upchieve.users
    ADD COLUMN IF NOT EXISTS sms_consent BOOLEAN NOT NULL DEFAULT FALSE;

-- migrate:down
ALTER TABLE upchieve.users
    DROP COLUMN IF EXISTS sms_consent;


-- migrate:up
ALTER TABLE upchieve.users
    ADD COLUMN IF NOT EXISTS sms_consent BOOLEAN NOT NULL DEFAULT FALSE;

-- migrate:down
ALTER TABLE upchieve.users
    DROP COLUMN IF EXISTS sms_consent;


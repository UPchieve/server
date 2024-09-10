-- migrate:up
ALTER TABLE upchieve.notifications
    ADD COLUMN IF NOT EXISTS email_template_id text;

-- migrate:down
ALTER TABLE upchieve.notifications
    DROP COLUMN IF EXISTS email_template_id text;


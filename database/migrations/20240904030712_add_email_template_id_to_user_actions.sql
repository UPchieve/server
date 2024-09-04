-- migrate:up
ALTER TABLE upchieve.user_actions
    ADD COLUMN IF NOT EXISTS email_template_id text;

-- migrate:down
ALTER TABLE upchieve.user_actions
    DROP COLUMN IF EXISTS email_template_id;


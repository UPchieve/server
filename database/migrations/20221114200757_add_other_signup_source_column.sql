-- migrate:up
ALTER TABLE upchieve.users
    ADD COLUMN IF NOT EXISTS other_signup_source text NULL;

-- migrate:down
ALTER TABLE upchieve.users
    DROP COLUMN IF EXISTS other_signup_source;


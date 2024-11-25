-- migrate:up
ALTER TABLE IF EXISTS upchieve.censored_session_messages
    ADD COLUMN IF NOT EXISTS shown boolean NOT NULL DEFAULT FALSE;

-- migrate:down
ALTER TABLE IF EXISTS upchieve.censored_session_messages
    DROP COLUMN IF EXISTS shown;


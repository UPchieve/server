-- migrate:up
ALTER TABLE IF EXISTS upchieve.censored_session_messages
    ALTER COLUMN sent_at TYPE TIMESTAMPTZ;

-- migrate:down
ALTER TABLE IF EXISTS upchieve.censored_session_messages
    ALTER COLUMN sent_at TYPE TIMESTAMP;


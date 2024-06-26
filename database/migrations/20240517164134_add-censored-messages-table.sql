-- migrate:up
CREATE TYPE moderation_system AS ENUM (
    'regex'
);

CREATE TABLE IF NOT EXISTS upchieve.censored_session_messages (
    id uuid PRIMARY KEY,
    sender_id uuid REFERENCES upchieve.users (id) NOT NULL,
    message text,
    session_id uuid NOT NULL REFERENCES upchieve.sessions (id),
    censored_by moderation_system NOT NULL,
    sent_at timestamp NOT NULL
);

CREATE INDEX IF NOT EXISTS censored_messages_session_id ON upchieve.censored_session_messages (session_id);

CREATE INDEX IF NOT EXISTS censored_messages_sent_at ON upchieve.censored_session_messages (sent_at);

-- migrate:down
DROP TABLE IF EXISTS upchieve.censored_session_messages;

DROP TYPE IF EXISTS moderation_system;


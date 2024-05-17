-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.censored_session_messages (
    id uuid PRIMARY KEY,
    sender_id uuid REFERENCES upchieve.users (id),
    contents text,
    session_id uuid NOT NULL REFERENCES upchieve.sessions (id),
    censored_by text NOT NULL,
    created_at timestamp NOT NULL
);

CREATE INDEX IF NOT EXISTS censored_messages_session_id ON upchieve.censored_session_messages (session_id);

CREATE INDEX IF NOT EXISTS censored_messages_created_at ON upchieve.censored_session_messages (created_at);

-- migrate:down
DROP TABLE IF EXISTS upchieve.censored_session_messages;


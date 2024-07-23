-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.session_voice_messages (
    id uuid PRIMARY KEY,
    session_id uuid NOT NULL REFERENCES upchieve.sessions (id),
    sender_id uuid NOT NULL REFERENCES upchieve.users (id),
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS session_voice_messages_session_id ON upchieve.session_voice_messages (session_id);

-- migrate:down
DROP TABLE IF EXISTS upchieve.session_voice_messages;


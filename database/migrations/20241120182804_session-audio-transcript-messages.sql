-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.session_audio_transcript_messages (
    id uuid NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES upchieve.users (id),
    session_id uuid NOT NULL REFERENCES upchieve.sessions (id),
    message text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.session_audio_transcript_messages;


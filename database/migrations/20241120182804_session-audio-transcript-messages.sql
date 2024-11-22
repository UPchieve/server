-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.session_audio_transcript_messages (
    id uuid NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES upchieve.users (id),
    session_id uuid NOT NULL REFERENCES upchieve.sessions (id),
    message text NOT NULL,
    said_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS session_audio_transcript_messages_session_id_idx ON upchieve.session_audio_transcript_messages (session_id);

CREATE INDEX IF NOT EXISTS session_audio_transcript_messages_user_id_idx ON upchieve.users (id);

-- migrate:down
DROP TABLE IF EXISTS upchieve.session_audio_transcript_messages;


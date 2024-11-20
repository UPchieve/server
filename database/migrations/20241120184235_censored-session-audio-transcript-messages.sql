-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.censored_session_audio_transcript_messages (
    session_audio_transcript_message_id uuid NOT NULL PRIMARY KEY REFERENCES upchieve.session_audio_transcript_messages (id),
    message text NOT NULL,
    said_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.censored_session_audio_transcript_messages;


-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.session_audio (
    id uuid NOT NULL PRIMARY KEY,
    session_id uuid NOT NULL REFERENCES upchieve.sessions (id),
    resource_uri text,
    student_joined_at timestamptz DEFAULT NULL,
    volunteer_joined_at timestamptz DEFAULT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS session_audio_session_id_idx ON upchieve.session_audio (session_id);

-- migrate:down
DROP TABLE IF EXISTS upchieve.session_audio;

DROP INDEX IF EXISTS session_audio_session_id_idx;


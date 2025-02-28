-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.session_meetings (
    id uuid NOT NULL PRIMARY KEY,
    external_id text NOT NULL,
    provider text NOT NULL,
    session_id uuid NOT NULL REFERENCES upchieve.sessions (id),
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

ALTER TABLE IF EXISTS upchieve.session_meetings
    ADD CONSTRAINT session_meetings_unique UNIQUE (session_id, provider);

CREATE INDEX IF NOT EXISTS session_meetings_session_id_idx ON upchieve.session_meetings (session_id);

-- migrate:down
DROP TABLE IF EXISTS upchieve.session_meetings;


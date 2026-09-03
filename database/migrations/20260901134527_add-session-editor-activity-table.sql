-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.session_editor_activity (
    id uuid PRIMARY KEY,
    session_id uuid NOT NULL REFERENCES upchieve.sessions (id),
    user_id uuid NOT NULL REFERENCES upchieve.users (id),
    source text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT session_editor_activity_source_check CHECK (source IN ('whiteboard', 'quill'))
);

CREATE INDEX IF NOT EXISTS session_editor_activity_session_id_idx ON upchieve.session_editor_activity (session_id);

CREATE INDEX IF NOT EXISTS session_editor_activity_user_id_idx ON upchieve.session_editor_activity (user_id);

COMMENT ON TABLE upchieve.session_editor_activity IS 'An append only table used to track tool activity during a coaching session so that we can more accurately calculate time tutored';

COMMENT ON COLUMN upchieve.session_editor_activity.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.session_editor_activity.session_id IS 'not_pii: Foreign key to upchieve.sessions';

COMMENT ON COLUMN upchieve.session_editor_activity.user_id IS 'not_pii: Foreign key to upchieve.users';

COMMENT ON COLUMN upchieve.session_editor_activity.source IS 'not_pii: An identifier for which tool was used';

COMMENT ON COLUMN upchieve.session_editor_activity.created_at IS 'not_pii: Time of creation';

-- migrate:down
DROP TABLE IF EXISTS upchieve.session_editor_activity;


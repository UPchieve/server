-- migrate:up
CREATE TYPE upchieve.tutor_bot_session_user_type AS ENUM (
    'student',
    'bot'
);

CREATE TABLE IF NOT EXISTS upchieve.tutor_bot_session_messages (
    id uuid PRIMARY KEY,
    session_id uuid NOT NULL REFERENCES upchieve.sessions (id),
    message text,
    tutor_bot_session_user_type upchieve.tutor_bot_session_user_type NOT NULL,
    created_at timestamptz NOT NULL DEFAULT NOW()
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.tutor_bot_session_messages;

DROP TYPE IF EXISTS upchieve.tutor_bot_session_user_type;


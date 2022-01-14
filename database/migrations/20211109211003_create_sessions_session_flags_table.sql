-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.sessions_session_flags (
    session_id uuid NOT NULL REFERENCES upchieve.sessions (id),
    session_flag_id int NOT NULL REFERENCES upchieve.session_flags (id),
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL,
    PRIMARY KEY (session_id, session_flag_id)
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.sessions_session_flags CASCADE;


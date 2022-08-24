-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.session_failed_joins (
    session_id uuid NOT NULL REFERENCES upchieve.sessions (id),
    user_id uuid NOT NULL REFERENCES upchieve.users (id),
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS upchieve.session_photos (
    session_id uuid NOT NULL REFERENCES upchieve.sessions (id),
    photo_key text NOT NULL,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS upchieve.session_review_reasons (
    session_id uuid NOT NULL REFERENCES upchieve.sessions (id),
    session_flag_id int NOT NULL REFERENCES upchieve.session_flags (id),
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL,
    PRIMARY KEY (session_id, session_flag_id)
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.session_failed_joins CASCADE;

DROP TABLE IF EXISTS upchieve.session_photos CASCADE;

DROP TABLE IF EXISTS upchieve.session_review_reasons CASCADE;


-- migrate:up
CREATE TYPE upchieve.session_medium AS enum (
    'audio',
    'video'
);

CREATE TABLE IF NOT EXISTS upchieve.user_censorships (
    user_id uuid NOT NULL REFERENCES upchieve.users (id),
    session_id uuid NOT NULL REFERENCES upchieve.sessions (id),
    reason text NOT NULL,
    medium upchieve.session_medium NOT NULL,
    active boolean NOT NULL DEFAULT TRUE,
    comment text DEFAULT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE upchieve.user_censorships
    ADD CONSTRAINT user_censorships_pkey PRIMARY KEY (user_id, session_id);

-- migrate:down
DROP TABLE IF EXISTS upchieve.user_censorships;

DROP TYPE IF EXISTS upchieve.session_medium;


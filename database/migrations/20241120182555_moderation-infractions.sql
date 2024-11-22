-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.moderation_infractions (
    id uuid NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES upchieve.users (id),
    session_id uuid NOT NULL REFERENCES upchieve.sessions (id),
    reason json NOT NULL,
    active boolean NOT NULL DEFAULT TRUE,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS moderation_infractions_user_id_session_id_idx ON upchieve.moderation_infractions (user_id, session_id);

-- migrate:down
DROP TABLE IF EXISTS upchieve.moderation_infractions;


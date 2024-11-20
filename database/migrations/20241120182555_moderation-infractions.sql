-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.moderation_infractions (
    id uuid NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES upchieve.users (id),
    session_id uuid NOT NULL REFERENCES upchieve.sessions (id),
    reason text NOT NULL,
    active boolean NOT NULL DEFAULT TRUE,
    said_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.moderation_infractions;


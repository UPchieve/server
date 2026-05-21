-- migrate:up
CREATE TABLE upchieve.session_last_seen (
    session_id uuid REFERENCES upchieve.sessions (id),
    user_id uuid REFERENCES upchieve.users (id),
    last_seen_at timestamptz,
    PRIMARY KEY (session_id, user_id)
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.session_last_seen;


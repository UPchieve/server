-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.session_messages (
    id uuid PRIMARY KEY,
    sender_id uuid REFERENCES upchieve.users (id),
    contents text,
    session_id uuid NOT NULL REFERENCES upchieve.sessions (id),
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.session_messages CASCADE;


-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.push_tokens (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES upchieve.users (id),
    token text NOT NULL,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.push_tokens CASCADE;


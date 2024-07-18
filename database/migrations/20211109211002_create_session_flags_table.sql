-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.session_flags (
    id serial PRIMARY KEY,
    name text NOT NULL UNIQUE,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.session_flags CASCADE;


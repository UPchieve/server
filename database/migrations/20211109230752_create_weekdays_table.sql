-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.weekdays (
    id serial PRIMARY KEY,
    day text NOT NULL UNIQUE,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.weekdays CASCADE;


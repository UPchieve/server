-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.certifications (
    id serial PRIMARY KEY,
    name text NOT NULL UNIQUE,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.certifications CASCADE;


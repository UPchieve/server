-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.us_states (
    code varchar(2) PRIMARY KEY NOT NULL UNIQUE,
    name text NOT NULL UNIQUE,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.us_states CASCADE;


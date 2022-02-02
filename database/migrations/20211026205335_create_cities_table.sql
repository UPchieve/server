-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.cities (
    id serial PRIMARY KEY,
    name text NOT NULL UNIQUE,
    us_state_code varchar(2) REFERENCES upchieve.us_states (code),
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.cities CASCADE;


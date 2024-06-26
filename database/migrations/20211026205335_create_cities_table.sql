-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.cities (
    id serial PRIMARY KEY,
    name text NOT NULL,
    us_state_code varchar(2) REFERENCES upchieve.us_states (code),
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

ALTER TABLE upchieve.cities
    ADD CONSTRAINT unique_city_name_state UNIQUE (name, us_state_code)
    -- migrate:down
    DROP CONSTRAINT IF EXISTS unique_city_name_state;

DROP TABLE IF EXISTS upchieve.cities CASCADE;


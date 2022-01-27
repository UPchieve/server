-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.schools (
    id uuid PRIMARY KEY,
    name text NOT NULL,
    approved boolean NOT NULL DEFAULT FALSE,
    partner boolean NOT NULL DEFAULT FALSE,
    city_id int REFERENCES upchieve.cities (id),
    us_state_code varchar(2) REFERENCES upchieve.us_states (code),
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL,
    name_search tsvector GENERATED always AS (to_tsvector('english', name)) stored
);

CREATE INDEX IF NOT EXISTS name_search_idx ON upchieve.schools USING gin (name_search);

-- migrate:down
DROP INDEX IF EXISTS upchieve.name_search_idx;

DROP TABLE IF EXISTS upchieve.schools CASCADE;


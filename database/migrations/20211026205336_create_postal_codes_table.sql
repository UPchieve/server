-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.postal_codes (
    code text PRIMARY KEY NOT NULL UNIQUE,
    us_state_code varchar(2) REFERENCES upchieve.us_states (code),
    income int,
    location point,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.postal_codes CASCADE;


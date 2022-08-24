-- migrate:up
ALTER TABLE upchieve.schools
    DROP COLUMN us_state_code;

-- migrate:down
ALTER TABLE upchieve.schools
    ADD COLUMN us_state_code varchar(2) REFERENCES upchieve.us_states (code);


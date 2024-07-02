-- migrate:up
ALTER TABLE upchieve.schools
    ADD CONSTRAINT unique_name__state_code_city_id UNIQUE (name, us_state_code, city_id);

-- migrate:down
ALTER TABLE upchieve.schools
    DROP CONSTRAINT unique_name__state_code_city_id;


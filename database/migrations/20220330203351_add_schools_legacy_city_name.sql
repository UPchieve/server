-- migrate:up
ALTER TABLE upchieve.schools
    ADD COLUMN legacy_city_name text;

-- migrate:down
ALTER TABLE upchieve.schools
    DROP COLUMN legacy_city_name;


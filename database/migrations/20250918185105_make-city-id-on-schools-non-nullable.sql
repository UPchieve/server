-- migrate:up
ALTER TABLE upchieve.schools
    ALTER COLUMN city_id SET NOT NULL;

-- migrate:down
ALTER TABLE upchieve.schools
    ALTER COLUMN city_id DROP NOT NULL;


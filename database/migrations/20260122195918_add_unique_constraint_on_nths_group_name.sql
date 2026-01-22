-- migrate:up
ALTER TABLE upchieve.nths_groups
    ADD CONSTRAINT unique_name UNIQUE (name);

-- migrate:down
ALTER TABLE upchieve.nths_groups
    DROP CONSTRAINT unique_name;


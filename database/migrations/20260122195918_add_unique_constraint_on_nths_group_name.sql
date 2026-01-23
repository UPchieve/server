-- migrate:up
ALTER TABLE upchieve.nths_groups
    ADD CONSTRAINT unique_name UNIQUE (name),
    ADD CONSTRAINT unique_key UNIQUE (KEY);

-- migrate:down
ALTER TABLE upchieve.nths_groups
    DROP CONSTRAINT unique_name,
    DROP CONSTRAINT unique_key;


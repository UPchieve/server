-- migrate:up
ALTER TABLE upchieve.assignments
    ADD COLUMN archived BOOLEAN;

-- migrate:down
ALTER TABLE upchieve.assignments
    DROP COLUMN archived;


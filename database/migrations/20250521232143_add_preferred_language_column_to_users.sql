-- migrate:up
ALTER TABLE upchieve.users
    ADD COLUMN preferred_language text;

-- migrate:down
ALTER TABLE upchieve.users
    DROP COLUMN preferred_language;


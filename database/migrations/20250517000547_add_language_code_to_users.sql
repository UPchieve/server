-- migrate:up
ALTER TABLE upchieve.users
    ADD COLUMN preferred_language_code VARCHAR(2);

-- migrate:down
ALTER TABLE upchieve.users
    DROP COLUMN preferred_language_code;


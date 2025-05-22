-- migrate:up
ALTER TABLE upchieve.users
    ALTER COLUMN preferred_language_code TYPE TEXT;

-- migrate:down
ALTER TABLE upchieve.users
    ALTER COLUMN preferred_language_code TYPE VARCHAR(2);


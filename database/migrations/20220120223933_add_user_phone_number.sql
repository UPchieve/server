-- migrate:up
ALTER TABLE upchieve.users
    ADD COLUMN phone TEXT;

-- migrate:down
ALTER TABLE upchieve.users
    DROP COLUMN phone;


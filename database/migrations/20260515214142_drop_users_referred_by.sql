-- migrate:up
ALTER TABLE upchieve.users
    DROP COLUMN referred_by;

-- migrate:down
ALTER TABLE upchieve.users
    ADD COLUMN referred_by uuid;


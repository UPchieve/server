-- migrate:up
ALTER TABLE upchieve.users
    ADD COLUMN deleted boolean DEFAULT FALSE;

-- migrate:down
ALTER TABLE upchieve.users
    DROP COLUMN deleted;


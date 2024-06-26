-- migrate:up
ALTER TABLE upchieve.users
    ADD COLUMN proxy_email text;

-- migrate:down
ALTER TABLE upchieve.users
    DROP COLUMN proxy_email;


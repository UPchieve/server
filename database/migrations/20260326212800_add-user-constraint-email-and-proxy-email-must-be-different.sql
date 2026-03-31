-- migrate:up
ALTER TABLE upchieve.users
    ADD CONSTRAINT users_email_proxy_email_differ CHECK (lower(email) <> lower(proxy_email));

-- migrate:down
ALTER TABLE upchieve.users
    DROP CONSTRAINT users_email_proxy_email_differ;


-- migrate:up
CREATE UNIQUE INDEX users_lowercase_proxy_email ON upchieve.users (lower(proxy_email));

ALTER TABLE upchieve.users
    ADD CONSTRAINT unique_proxy_email UNIQUE (proxy_email);

-- migrate:down
ALTER TABLE upchieve.users
    DROP CONSTRAINT unique_proxy_email;

DROP INDEX upchieve.users_lowercase_proxy_email;


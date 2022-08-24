-- migrate:up
ALTER TABLE upchieve.users_ip_addresses
    ADD CONSTRAINT unique_user_id_ip_address_id UNIQUE (user_id, ip_address_id);

-- migrate:down
ALTER TABLE upchieve.users_ip_addresses
    DROP CONSTRAINT unique_user_id_ip_address_id;


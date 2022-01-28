-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.users_ip_addresses (
    id uuid PRIMARY KEY,
    ip_address_id int NOT NULL REFERENCES upchieve.ip_addresses (id),
    user_id uuid NOT NULL REFERENCES upchieve.users (id),
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.users_ip_addresses CASCADE;


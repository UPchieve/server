-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.ip_addresses (
    id bigserial PRIMARY KEY,
    ip inet NOT NULL UNIQUE,
    status text,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.ip_addresses CASCADE;


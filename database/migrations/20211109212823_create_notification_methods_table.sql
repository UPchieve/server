-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.notification_methods (
    id serial PRIMARY KEY,
    method text NOT NULL UNIQUE,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.notification_methods CASCADE;


-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.notification_priority_groups (
    id serial PRIMARY KEY,
    name text NOT NULL UNIQUE,
    priority smallint NOT NULL,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.notification_priority_groups CASCADE;


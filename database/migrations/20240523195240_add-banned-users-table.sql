-- migrate:up
CREATE TYPE upchieve.ban_types AS ENUM (
    'shadow',
    'complete'
);

CREATE TABLE IF NOT EXISTS upchieve.banned_users (
    user_id uuid PRIMARY KEY NOT NULL REFERENCES upchieve.users (id),
    ban_type ban_types NOT NULL,
    ban_reason_id integer REFERENCES upchieve.ban_reasons (id),
    created_at timestamp NOT NULL,
    updated_at timestamp)
-- migrate:down
DROP TABLE IF EXISTS upchieve.banned_users;

DROP TYPE IF EXISTS upchieve.ban_types;


-- migrate:up
CREATE TYPE ban_types AS ENUM (
    'shadow',
    'complete'
);

CREATE TABLE IF NOT EXISTS upchieve.banned_users (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES upchieve.users (id),
    ban_type ban_types NOT NULL,
    created_at timestamp NOT NULL,
    updated_at timestamp,
    ban_reason_id integer REFERENCES upchieve.ban_reasons (id))
-- migrate:down
DROP TABLE IF EXISTS upchieve.banned_users;

DROP TYPE IF EXISTS ban_types;


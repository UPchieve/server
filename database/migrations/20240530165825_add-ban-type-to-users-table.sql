-- migrate:up
CREATE TYPE upchieve.ban_types AS ENUM (
    'shadow',
    'complete'
);

ALTER TABLE upchieve.users
    ADD COLUMN IF NOT EXISTS ban_type upchieve.ban_types;

-- migrate:down
ALTER TABLE upchieve.users
    DROP COLUMN IF EXISTS ban_type;

DROP TYPE IF EXISTS upchieve.ban_types;


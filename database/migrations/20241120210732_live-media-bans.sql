-- migrate:up
-- DML (i.e. `INSERT INTO upchieve.ban_reasons ('automated moderation')`) was moved
-- to seed-update 20260709120004_add-live-media-ban-reason so this migration is
-- DDL-only and safe to run on logical-replication subscribers.
ALTER TYPE upchieve.ban_types
    ADD VALUE IF NOT EXISTS 'live_media';

-- migrate:down
ALTER TYPE upchieve.ban_types RENAME TO ban_types_markedfordelete;

CREATE TYPE upchieve.ban_types AS ENUM (
    'shadow',
    'complete'
);

ALTER TABLE upchieve.users
    ALTER COLUMN ban_type TYPE upchieve.ban_types
    USING CASE WHEN ban_type = 'shadow' THEN
        'shadow'::upchieve.ban_types
    WHEN ban_type = 'complete' THEN
        'complete'::upchieve.ban_types
    ELSE
        NULL
    END;

DROP TYPE upchieve.ban_types_markedfordelete;


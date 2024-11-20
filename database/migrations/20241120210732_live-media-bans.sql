-- migrate:up
ALTER TYPE upchieve.ban_types
    ADD VALUE IF NOT EXISTS 'live_media';

INSERT INTO upchieve.ban_reasons (name, created_at, updated_at)
    VALUES ('automated moderation', NOW(), NOW());

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

DELETE FROM upchieve.ban_reasons
WHERE name = 'automated moderation';


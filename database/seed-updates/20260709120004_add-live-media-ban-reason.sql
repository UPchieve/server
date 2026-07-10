-- migrate:up
-- Moved out of migration 20241120210732_live-media-bans so that DML is not applied
-- to logical-replication subscribers.
-- Idempotent so it is a harmless no-op on systems that already have the row.
INSERT INTO upchieve.ban_reasons (name, created_at, updated_at)
    VALUES ('automated moderation', NOW(), NOW())
ON CONFLICT (name)
    DO NOTHING;

-- migrate:down
DELETE FROM upchieve.ban_reasons
WHERE name = 'automated moderation';


-- migrate:up
-- Moved out of migration 20250522182628_add-ambassador-role so that DML is not
-- applied to logical-replication subscribers.
-- Idempotent so it is a harmless no-op on systems that already have the row.
INSERT INTO upchieve.user_roles (name)
    VALUES ('ambassador')
ON CONFLICT (name)
    DO NOTHING;

-- migrate:down
DELETE FROM upchieve.user_roles
WHERE name = 'ambassador';


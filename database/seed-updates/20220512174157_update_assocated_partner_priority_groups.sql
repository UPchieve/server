-- migrate:up
INSERT INTO upchieve.notification_priority_groups (name, priority, created_at, updated_at)
    VALUES ('Associated partner volunteers - not notified in the last 24 hours AND they don''t have "high level subjects"', 85, NOW(), NOW())
ON CONFLICT ON CONSTRAINT notification_priority_groups_name_key
    DO NOTHING;

INSERT INTO upchieve.notification_priority_groups (name, priority, created_at, updated_at)
    VALUES ('Associated partner volunteers - not notified in the last 3 days AND they don''t have "high level subjects"', 95, NOW(), NOW())
ON CONFLICT ON CONSTRAINT notification_priority_groups_name_key
    DO NOTHING;

-- migrate:down
DELETE FROM upchieve.notification_priority_groups
WHERE name = 'Associated partner volunteers - not notified in the last 24 hours AND they don''t have "high level subjects"';

DELETE FROM upchieve.notification_priority_groups
WHERE name = 'Associated partner volunteers - not notified in the last 3 days AND they don''t have "high level subjects"';


-- migrate:up
INSERT INTO upchieve.notification_priority_groups (name, priority)
    VALUES ('Favorite volunteers', 10), ('Associated partner volunteers', 20), ('Regular volunteers', 30);

-- migrate:down
DELETE FROM upchieve.notification_priority_groups
WHERE name IN ('Favorite volunteers', 'Associated partner volunteers', 'Regular volunteers');


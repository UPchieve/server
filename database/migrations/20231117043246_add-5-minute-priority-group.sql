-- migrate:up
INSERT INTO upchieve.notification_priority_groups (name, priority)
    VALUES ('All volunteers - not notified in the last 5 mins', 5);

-- migrate:down
DELETE FROM upchieve.notification_priority_groups
WHERE name = 'All volunteers - not notified in the last 5 mins';


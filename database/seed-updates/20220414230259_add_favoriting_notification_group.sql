-- migrate:up
UPDATE
    upchieve.notification_priority_groups
SET
    priority = 20,
    updated_at = NOW()
WHERE
    name = 'Partner volunteers - not notified in the last 3 days AND they don''t have "high level subjects"'
    AND NOT EXISTS (
        SELECT
            *
        FROM
            upchieve.notification_priority_groups
        WHERE
            priority = 20);

UPDATE
    upchieve.notification_priority_groups
SET
    priority = 30,
    updated_at = NOW()
WHERE
    name = 'Regular volunteers - not notified in the last 3 days AND they don''t have "high level subjects"'
    AND NOT EXISTS (
        SELECT
            *
        FROM
            upchieve.notification_priority_groups
        WHERE
            priority = 30);

UPDATE
    upchieve.notification_priority_groups
SET
    priority = 40,
    updated_at = NOW()
WHERE
    name = 'Partner volunteers - not notified in the last 24 hours AND they don''t have "high level subjects"'
    AND NOT EXISTS (
        SELECT
            *
        FROM
            upchieve.notification_priority_groups
        WHERE
            priority = 40);

UPDATE
    upchieve.notification_priority_groups
SET
    priority = 50,
    updated_at = NOW()
WHERE
    name = 'Regular volunteers - not notified in the last 24 hours AND they don''t have "high level subjects"'
    AND NOT EXISTS (
        SELECT
            *
        FROM
            upchieve.notification_priority_groups
        WHERE
            priority = 50);

UPDATE
    upchieve.notification_priority_groups
SET
    priority = 60,
    updated_at = NOW()
WHERE
    name = 'All volunteers - not notified in the last 24 hours'
    AND NOT EXISTS (
        SELECT
            *
        FROM
            upchieve.notification_priority_groups
        WHERE
            priority = 60);

UPDATE
    upchieve.notification_priority_groups
SET
    priority = 70,
    updated_at = NOW()
WHERE
    name = 'All volunteers - not notified in the last 60 mins'
    AND NOT EXISTS (
        SELECT
            *
        FROM
            upchieve.notification_priority_groups
        WHERE
            priority = 70);

UPDATE
    upchieve.notification_priority_groups
SET
    priority = 80,
    updated_at = NOW()
WHERE
    name = 'All volunteers - not notified in the last 15 mins'
    AND NOT EXISTS (
        SELECT
            *
        FROM
            upchieve.notification_priority_groups
        WHERE
            priority = 80);

UPDATE
    upchieve.notification_priority_groups
SET
    priority = 90,
    updated_at = NOW()
WHERE
    name = 'Verizon volunteers - not notified in the last 24 hours AND they don''t have "high level subjects"'
    AND NOT EXISTS (
        SELECT
            *
        FROM
            upchieve.notification_priority_groups
        WHERE
            priority = 90);

UPDATE
    upchieve.notification_priority_groups
SET
    priority = 100,
    updated_at = NOW()
WHERE
    name = 'Verizon volunteers - not notified in the last 3 days AND they don''t have "high level subjects"'
    AND NOT EXISTS (
        SELECT
            *
        FROM
            upchieve.notification_priority_groups
        WHERE
            priority = 100);

INSERT INTO upchieve.notification_priority_groups (name, priority, created_at, updated_at)
    VALUES ('Favorite volunteers - not notified in the last 15 mins', 10, NOW(), NOW())
ON CONFLICT ON CONSTRAINT notification_priority_groups_name_key
    DO NOTHING;

-- migrate:down
DELETE FROM upchieve.notification_priority_groups
WHERE name = 'Favorite volunteers - not notified in the last 15 mins';

UPDATE
    upchieve.notification_priority_groups
SET
    priority = 1,
    updated_at = NOW()
WHERE
    name = 'Partner volunteers - not notified in the last 3 days AND they don''t have "high level subjects"';

UPDATE
    upchieve.notification_priority_groups
SET
    priority = 2,
    updated_at = NOW()
WHERE
    name = 'Regular volunteers - not notified in the last 3 days AND they don''t have "high level subjects"';

UPDATE
    upchieve.notification_priority_groups
SET
    priority = 3,
    updated_at = NOW()
WHERE
    name = 'Partner volunteers - not notified in the last 24 hours AND they don''t have "high level subjects"';

UPDATE
    upchieve.notification_priority_groups
SET
    priority = 4,
    updated_at = NOW()
WHERE
    name = 'Regular volunteers - not notified in the last 24 hours AND they don''t have "high level subjects"';

UPDATE
    upchieve.notification_priority_groups
SET
    priority = 5,
    updated_at = NOW()
WHERE
    name = 'All volunteers - not notified in the last 24 hours';

UPDATE
    upchieve.notification_priority_groups
SET
    priority = 6,
    updated_at = NOW()
WHERE
    name = 'All volunteers - not notified in the last 60 mins';

UPDATE
    upchieve.notification_priority_groups
SET
    priority = 7,
    updated_at = NOW()
WHERE
    name = 'All volunteers - not notified in the last 15 mins';

UPDATE
    upchieve.notification_priority_groups
SET
    priority = 8,
    updated_at = NOW()
WHERE
    name = 'Verizon volunteers - not notified in the last 24 hours AND they don''t have "high level subjects"';

UPDATE
    upchieve.notification_priority_groups
SET
    priority = 9,
    updated_at = NOW()
WHERE
    name = 'Verizon volunteers - not notified in the last 3 days AND they don''t have "high level subjects"';


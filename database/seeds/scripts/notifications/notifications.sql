/* @name insertNotificationMethod */
WITH ins AS(
    INSERT INTO notification_methods (method, created_at, updated_at)
        VALUES (:method!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        id AS ok
)
SELECT * FROM ins
UNION
    SELECT id AS ok FROM notification_methods WHERE method=:method!;


/* @name insertNotificationType */
WITH ins AS(
    INSERT INTO notification_types (type, created_at, updated_at)
        VALUES (:type!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        id AS ok
)
SELECT * FROM ins
UNION
    SELECT id AS ok FROM notification_types WHERE type=:type!;


/* @name insertPriorityGroup */
WITH ins AS(
    INSERT INTO notification_priority_groups (name, priority, created_at, updated_at)
        VALUES (:name!, :priority!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        id AS ok
)
SELECT * FROM ins
UNION
    SELECT id AS ok FROM notification_priority_groups WHERE name=:name!;


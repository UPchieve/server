/* @name insertNotificationMethod */
INSERT INTO notification_methods (method, created_at, updated_at) VALUES (:method!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok;

/* @name insertNotificationType */
INSERT INTO notification_types (type, created_at, updated_at) VALUES (:type!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok;

/* @name insertPriorityGroup */
INSERT INTO notification_priority_groups (name, priority, created_at, updated_at) VALUES (:name!, :priority!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotificationsForGentleWarning = exports.getSessionNotificationsWithSessionId = exports.getNotificationsByVolunteerId = void 0;
/** Types generated for queries found in "server/models/Notification/notification.sql" */
const query_1 = require("@pgtyped/query");
const getNotificationsByVolunteerIdIR = { "name": "getNotificationsByVolunteerId", "params": [{ "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 674, "b": 680, "line": 18, "col": 29 }] } }], "usedParamSet": { "userId": true }, "statement": { "body": "SELECT\n    notifications.id,\n    user_id AS volunteer,\n    sent_at,\n    successful AS was_successful,\n    message_carrier_id AS message_id,\n    session_id,\n    notification_types.type AS TYPE,\n    notification_priority_groups.name AS priority_group,\n    notification_methods.method AS method\nFROM\n    notifications\n    LEFT JOIN notification_methods ON notifications.method_id = notification_methods.id\n    LEFT JOIN notification_types ON notifications.type_id = notification_types.id\n    LEFT JOIN notification_priority_groups ON notifications.priority_group_id = notification_priority_groups.id\nWHERE\n    notifications.user_id = :userId!", "loc": { "a": 42, "b": 680, "line": 2, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     notifications.id,
 *     user_id AS volunteer,
 *     sent_at,
 *     successful AS was_successful,
 *     message_carrier_id AS message_id,
 *     session_id,
 *     notification_types.type AS TYPE,
 *     notification_priority_groups.name AS priority_group,
 *     notification_methods.method AS method
 * FROM
 *     notifications
 *     LEFT JOIN notification_methods ON notifications.method_id = notification_methods.id
 *     LEFT JOIN notification_types ON notifications.type_id = notification_types.id
 *     LEFT JOIN notification_priority_groups ON notifications.priority_group_id = notification_priority_groups.id
 * WHERE
 *     notifications.user_id = :userId!
 * ```
 */
exports.getNotificationsByVolunteerId = new query_1.PreparedQuery(getNotificationsByVolunteerIdIR);
const getSessionNotificationsWithSessionIdIR = { "name": "getSessionNotificationsWithSessionId", "params": [{ "name": "sessionId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 1691, "b": 1700, "line": 42, "col": 32 }] } }], "usedParamSet": { "sessionId": true }, "statement": { "body": "SELECT\n    notifications.id,\n    sent_at,\n    successful AS was_successful,\n    message_carrier_id AS message_id,\n    session_id,\n    notification_types.type AS TYPE,\n    notification_priority_groups.name AS priority_group,\n    notification_methods.method AS method,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    users.first_name AS first_name\nFROM\n    notifications\n    LEFT JOIN notification_methods ON notifications.method_id = notification_methods.id\n    LEFT JOIN notification_types ON notifications.type_id = notification_types.id\n    LEFT JOIN notification_priority_groups ON notifications.priority_group_id = notification_priority_groups.id\n    LEFT JOIN users ON notifications.user_id = users.id\n    LEFT JOIN volunteer_profiles ON notifications.user_id = volunteer_profiles.user_id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_profiles.volunteer_partner_org_id = volunteer_partner_orgs.id\nWHERE\n    notifications.session_id = :sessionId!", "loc": { "a": 734, "b": 1700, "line": 22, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     notifications.id,
 *     sent_at,
 *     successful AS was_successful,
 *     message_carrier_id AS message_id,
 *     session_id,
 *     notification_types.type AS TYPE,
 *     notification_priority_groups.name AS priority_group,
 *     notification_methods.method AS method,
 *     volunteer_partner_orgs.key AS volunteer_partner_org,
 *     users.first_name AS first_name
 * FROM
 *     notifications
 *     LEFT JOIN notification_methods ON notifications.method_id = notification_methods.id
 *     LEFT JOIN notification_types ON notifications.type_id = notification_types.id
 *     LEFT JOIN notification_priority_groups ON notifications.priority_group_id = notification_priority_groups.id
 *     LEFT JOIN users ON notifications.user_id = users.id
 *     LEFT JOIN volunteer_profiles ON notifications.user_id = volunteer_profiles.user_id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_profiles.volunteer_partner_org_id = volunteer_partner_orgs.id
 * WHERE
 *     notifications.session_id = :sessionId!
 * ```
 */
exports.getSessionNotificationsWithSessionId = new query_1.PreparedQuery(getSessionNotificationsWithSessionIdIR);
const getNotificationsForGentleWarningIR = { "name": "getNotificationsForGentleWarning", "params": [{ "name": "sessionId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 2281, "b": 2290, "line": 65, "col": 32 }] } }], "usedParamSet": { "sessionId": true }, "statement": { "body": "SELECT\n    users.id,\n    users.first_name AS first_name,\n    users.email AS email,\n    COUNT(*)::int AS total_notifications\nFROM\n    notifications\n    JOIN sessions ON notifications.session_id = sessions.id\n    JOIN users ON notifications.user_id = users.id\n    JOIN (\n        SELECT\n            sessions.volunteer_id\n        FROM\n            sessions\n        GROUP BY\n            volunteer_id\n        HAVING\n            COUNT(*) = 0) AS session_count ON session_count.volunteer_id = users.id\nWHERE\n    notifications.session_id = :sessionId!\n    AND notifications.user_id != sessions.volunteer_id\nGROUP BY\n    users.id", "loc": { "a": 1750, "b": 2367, "line": 46, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     users.first_name AS first_name,
 *     users.email AS email,
 *     COUNT(*)::int AS total_notifications
 * FROM
 *     notifications
 *     JOIN sessions ON notifications.session_id = sessions.id
 *     JOIN users ON notifications.user_id = users.id
 *     JOIN (
 *         SELECT
 *             sessions.volunteer_id
 *         FROM
 *             sessions
 *         GROUP BY
 *             volunteer_id
 *         HAVING
 *             COUNT(*) = 0) AS session_count ON session_count.volunteer_id = users.id
 * WHERE
 *     notifications.session_id = :sessionId!
 *     AND notifications.user_id != sessions.volunteer_id
 * GROUP BY
 *     users.id
 * ```
 */
exports.getNotificationsForGentleWarning = new query_1.PreparedQuery(getNotificationsForGentleWarningIR);

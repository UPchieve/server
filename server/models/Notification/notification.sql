/* @name getTextNotificationsByVolunteerId */
SELECT
    notifications.id,
    user_id AS volunteer,
    sent_at,
    successful AS was_successful,
    message_carrier_id AS message_id,
    session_id,
    notification_types.type AS TYPE,
    notification_priority_groups.name AS priority_group,
    notification_methods.method AS method
FROM
    notifications
    LEFT JOIN notification_methods ON notifications.method_id = notification_methods.id
    LEFT JOIN notification_types ON notifications.type_id = notification_types.id
    LEFT JOIN notification_priority_groups ON notifications.priority_group_id = notification_priority_groups.id
WHERE
    notifications.user_id = :userId!
    AND notifications.method_id = 1;


/* @name getSessionNotificationsWithSessionId */
SELECT
    notifications.id,
    sent_at,
    successful AS was_successful,
    message_carrier_id AS message_id,
    session_id,
    notification_types.type AS TYPE,
    notification_priority_groups.name AS priority_group,
    notification_methods.method AS method,
    volunteer_partner_orgs.key AS volunteer_partner_org,
    users.first_name AS first_name
FROM
    notifications
    LEFT JOIN notification_methods ON notifications.method_id = notification_methods.id
    LEFT JOIN notification_types ON notifications.type_id = notification_types.id
    LEFT JOIN notification_priority_groups ON notifications.priority_group_id = notification_priority_groups.id
    LEFT JOIN users ON notifications.user_id = users.id
    LEFT JOIN volunteer_profiles ON notifications.user_id = volunteer_profiles.user_id
    LEFT JOIN volunteer_partner_orgs ON volunteer_profiles.volunteer_partner_org_id = volunteer_partner_orgs.id
WHERE
    notifications.session_id = :sessionId!
    AND notification_types.type IS NOT NULL;


/* @name getNotificationsForGentleWarning */
SELECT
    users.id,
    users.first_name AS first_name,
    users.email AS email,
    COUNT(*)::int AS total_notifications
FROM
    notifications
    JOIN sessions ON notifications.session_id = sessions.id
    JOIN users ON notifications.user_id = users.id
    JOIN (
        SELECT
            sessions.volunteer_id
        FROM
            sessions
        GROUP BY
            volunteer_id
        HAVING
            COUNT(*) = 0) AS session_count ON session_count.volunteer_id = users.id
WHERE
    notifications.session_id = :sessionId!
    AND notifications.user_id != sessions.volunteer_id
GROUP BY
    users.id;


/* @name createEmailNotification */
INSERT INTO notifications (id, user_id, session_id, email_template_id, method_id, sent_at)
SELECT
    generate_ulid (),
    :userId!,
    :sessionId,
    :emailTemplateId!,
    (
        SELECT
            id
        FROM
            notification_methods
        WHERE
            method = 'email'), NOW()
RETURNING
    id AS ok;


/* @name getEmailNotificationsByTemplateId */
SELECT
    user_id,
    session_id,
    email_template_id,
    sent_at
FROM
    notifications
    JOIN notification_methods ON notifications.method_id = notification_methods.id
WHERE
    notification_methods.method = 'email'
    AND email_template_id = :emailTemplateId!
    AND (:userId::uuid IS NULL
        OR user_id = :userId::uuid)
    AND ((:start)::timestamptz IS NULL
        OR sent_at >= (:start)::timestamptz
        AND ((:end)::timestamptz IS NULL
            OR sent_at <= (:end)::timestamptz));


/* @name addSessionSummary */
INSERT INTO session_summaries (id, session_id, summary, user_type_id, created_at, updated_at)
    VALUES (:id!, :sessionId!, :summary!, (
            SELECT
                id
            FROM
                user_roles
            WHERE
                name = :userType!), NOW(), NOW())
RETURNING
    id,
    session_id,
    summary,
    (
        SELECT
            name
        FROM
            user_roles
        WHERE
            id = session_summaries.user_type_id) AS user_type,
    created_at;


/* @name getSessionSummaryBySessionId */
SELECT
    ss.id,
    ss.session_id,
    ss.summary,
    ur.name AS user_type,
    ss.created_at
FROM
    session_summaries ss
    JOIN user_roles ur ON ss.user_type_id = ur.id
WHERE
    ss.session_id = :sessionId!
    AND ur.name = :userType!
ORDER BY
    ss.created_at DESC
LIMIT 1;


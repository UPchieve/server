/* @name addSessionSummary */
INSERT INTO session_summaries (id, session_id, summary, user_type, created_at, updated_at)
    VALUES (:id!, :sessionId!, :summary, (
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
    user_type,
    created_at;


/* @name getSessionSummariesBySessionId */
SELECT
    id,
    session_id,
    summary,
    user_type,
    created_at
FROM
    session_summaries
WHERE
    session_id = :sessionId!;


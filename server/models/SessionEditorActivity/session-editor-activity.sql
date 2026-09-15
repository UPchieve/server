/* @name getSessionEditorActivity */
SELECT
    id,
    user_id,
    session_id,
    source,
    created_at
FROM
    session_editor_activity
WHERE
    session_id = :sessionId!
ORDER BY
    created_at;


/* @name insertSessionEditorActivity */
INSERT INTO session_editor_activity (id, session_id, user_id, source)
    VALUES (:id!, :sessionId!, :userId!, :source!)
RETURNING
    id;


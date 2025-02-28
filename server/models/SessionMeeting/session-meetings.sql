/* @name getSessionMeetingBySessionId */
SELECT
    *
FROM
    session_meetings
WHERE
    session_id = :sessionId!;


/* @name insertSessionMeeting */
INSERT INTO session_meetings (id, external_id, provider, session_id, created_at, updated_at)
    VALUES (:id!, :externalId!, :provider!, :sessionId!, NOW(), NOW())
RETURNING
    *;


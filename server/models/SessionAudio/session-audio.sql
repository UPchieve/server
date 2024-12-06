/* @name getSessionAudioBySessionId */
SELECT
    *
FROM
    session_audio
WHERE
    session_id = :sessionId!;


/* @name createSessionAudio */
INSERT INTO session_audio (id, session_id, resource_uri, student_joined_at, volunteer_joined_at, created_at, updated_at)
    VALUES (:id!, :sessionId!, :resourceUri, :studentJoinedAt, :volunteerJoinedAt, NOW(), NOW())
RETURNING
    *;


/* @name updateSessionAudio */
UPDATE
    session_audio
SET
    student_joined_at = COALESCE(:studentJoinedAt, student_joined_at),
    volunteer_joined_at = COALESCE(:volunteerJoinedAt, volunteer_joined_at),
    resource_uri = COALESCE(:resourceUri, resource_uri),
    updated_at = NOW()
WHERE
    session_id = :sessionId!
RETURNING
    *;


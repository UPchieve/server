/* @name getSessionAudioBySessionId */
SELECT
    *
FROM
    session_audio
WHERE
    session_id = :sessionId!;


/* @name createSessionAudio */
INSERT INTO session_audio (id, session_id, resource_uri, student_joined_at, volunteer_joined_at, created_by, created_at, updated_at)
    VALUES (:id!, :sessionId!, :resourceUri, NULL, NULL, :createdByRole!, NOW(), NOW())
RETURNING
    id AS created_id;


/* @name updateSessionAudioJoinedAtBySessionId */
UPDATE
    session_audio
SET
    student_joined_at = COALESCE(:studentJoinedAt, student_joined_at),
    volunteer_joined_at = COALESCE(:volunteerJoinedAt, volunteer_joined_at),
    updated_at = NOW()
WHERE
    session_id = :sessionId!;


/* @name updateSessionAudioResourceUriBySessionId */
UPDATE
    session_audio
SET
    resource_uri = :resourceUri!,
    updated_at = NOW()
WHERE
    session_id = :sessionId!;


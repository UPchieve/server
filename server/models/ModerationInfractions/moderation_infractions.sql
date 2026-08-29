/* @name insertModerationInfraction */
INSERT INTO moderation_infractions (id, user_id, session_id, reason, active)
    VALUES (:id!, :userId!, :sessionId!, :reason!, TRUE)
RETURNING
    *;


/* @name updateModerationInfractionById */
UPDATE
    moderation_infractions
SET
    active = COALESCE(:active, active)
WHERE
    id = :id!;


/* @name deactivateModerationInfractionByUserId */
UPDATE
    moderation_infractions
SET
    active = FALSE
WHERE
    user_id = :userId!;


/* @name getModerationInfractionsByUser */
SELECT
    *
FROM
    moderation_infractions
WHERE
    user_id = :userId!
    AND (:sessionId::uuid IS NULL
        OR session_id = :sessionId)
    AND (:active::boolean IS NULL
        OR active = :active);


/* @name insertQuarantinedPhotoInfraction */
INSERT INTO moderation_infractions (id, user_id, session_id, reason, active, quarantined_on)
    VALUES (:id!, :userId!, :sessionId, :reason!, TRUE, :quarantinedDate!)
RETURNING
    id, user_id, reason, active, created_at, updated_at;


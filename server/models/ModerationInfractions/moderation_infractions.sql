/* @name insertModerationInfraction */
WITH insert_query AS (
INSERT INTO moderation_infractions (id, user_id, session_id, reason)
        VALUES (:id!, :userId!, :sessionId!, :reason!))
    SELECT
        *
    FROM
        moderation_infractions
    WHERE
        active = TRUE
            AND user_id = :userId!;


/* @name updateModerationInfractionById */
UPDATE
    moderation_infractions
SET
    active = COALESCE(:active, active)
WHERE
    id = :id!;


/* @name getModerationInfractionsByUserAndSession */
SELECT
    *
FROM
    moderation_infractions
WHERE
    user_id = :userId!
    AND session_id = :sessionId!;


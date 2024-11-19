/* @name insertUserCensorship */
WITH insert_rows AS (
INSERT INTO user_censorships (id, user_id, session_id, medium, reason, active, comment, message_sent_at)
        VALUES (:id!, :userId!, :sessionId!, :medium!, :reason!, :active!, :comment, :messageSentAt!))
    SELECT
        1 + count(*) AS count_censorships_by_user_in_session
    FROM
        user_censorships
    WHERE
        active = TRUE
            AND user_id = :userId!
            AND session_id = :sessionId!;


/* @name getUserCensorshipsBySessionId */
SELECT
    *
FROM
    user_censorships
WHERE
    session_id = :sessionId!;


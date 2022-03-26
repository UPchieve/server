/* @name savePresessionSurvey */
INSERT INTO pre_session_surveys (id, user_id, session_id, response_data, created_at, updated_at)
SELECT
    :id!,
    :userId!,
    :sessionId!,
    :responseData!,
    NOW(),
    NOW()
ON CONFLICT (session_id)
    DO UPDATE SET
        response_data = :responseData!,
        updated_at = NOW()::date
    RETURNING
        id,
        user_id,
        session_id,
        response_data,
        created_at,
        updated_at;


/* @name getPresessionSurvey */
SELECT
    id,
    user_id,
    session_id,
    response_data,
    created_at,
    updated_at
FROM
    pre_session_surveys
WHERE
    user_id = :userId!
    AND session_id = :sessionId!;


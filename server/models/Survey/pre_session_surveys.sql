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


/* @name getPresessionSurveyNew */
SELECT
    sq.id AS question_id,
    sq.question_text,
    ssq.display_priority,
    qt.name AS question_type,
    sub.response_id,
    sub.response_text,
    sub.response_display_priority
FROM
    surveys_context
    JOIN surveys ON survey_id = surveys.id
    JOIN subjects ON subject_id = subjects.id
    JOIN surveys_survey_questions ssq ON ssq.survey_id = surveys.id
    JOIN survey_questions sq ON ssq.survey_question_id = sq.id
    JOIN question_types qt ON qt.id = sq.question_type_id
    JOIN LATERAL (
        SELECT
            id AS response_id,
            choice_text AS response_text,
            display_priority AS response_display_priority
        FROM
            survey_questions_response_choices sqrc
            JOIN survey_response_choices src ON src.id = sqrc.response_choice_id
        WHERE
            sqrc.surveys_survey_question_id = ssq.id) sub ON TRUE
WHERE
    subjects.name = :subjectName!;


/* @name getPresessionSurveyResponse */
SELECT
    sq.response_display_text AS display_label,
    (
        CASE WHEN src.choice_text = 'Other' THEN
            uss.open_response
        ELSE
            src.choice_text
        END) AS response,
    COALESCE(src.score, 0) AS score,
    ssq.display_priority AS display_order,
    src.display_image as display_image
FROM
    users_surveys AS us
    JOIN sessions AS s ON s.student_id = us.user_id
    JOIN survey_types AS st ON us.survey_type_id = st.id
    JOIN users_surveys_submissions AS uss ON us.id = uss.user_survey_id
    LEFT JOIN survey_response_choices AS src ON uss.survey_response_choice_id = src.id
    JOIN survey_questions AS sq ON uss.survey_question_id = sq.id
    LEFT JOIN surveys_survey_questions AS ssq ON us.survey_id = ssq.survey_id
        AND uss.survey_question_id = ssq.survey_question_id
WHERE
    us.session_id = :sessionId!
    AND s.id = :sessionId!
    AND st.name = 'presession'
ORDER BY
    ssq.display_priority ASC;


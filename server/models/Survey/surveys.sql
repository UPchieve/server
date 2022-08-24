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


/* @name saveUserSurvey */
INSERT INTO users_surveys (id, survey_id, user_id, session_id, survey_type_id, created_at, updated_at)
SELECT
    generate_ulid (),
    :surveyId!,
    :userId!,
    :sessionId!,
    :surveyTypeId!,
    NOW(),
    NOW()
RETURNING
    id,
    survey_id,
    user_id,
    session_id,
    survey_type_id,
    created_at,
    updated_at;


/* @name saveUserSurveySubmissions */
INSERT INTO users_surveys_submissions (user_survey_id, survey_question_id, survey_response_choice_id, open_response, created_at, updated_at)
SELECT
    :userSurveyId!,
    :questionId!,
    :responseChoiceId!,
    :openResponse,
    NOW(),
    NOW()
RETURNING
    user_survey_id AS ok;


/* @name getPresessionSurveyForFeedback */
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


/* @name getStudentsPresessionGoal */
SELECT
    (
        CASE WHEN src.choice_text = 'Other' THEN
            uss.open_response
        ELSE
            src.choice_text
        END) AS goal
FROM
    users_surveys
    JOIN users_surveys_submissions uss ON users_surveys.id = uss.user_survey_id
    JOIN survey_questions sq ON uss.survey_question_id = sq.id
    JOIN survey_response_choices src ON uss.survey_response_choice_id = src.id
WHERE
    users_surveys.session_id = :sessionId!
    AND sq.question_text = 'What is your primary goal for today''s session?';


/* @name getSurveyDefinition */
SELECT
    sq.id AS question_id,
    FORMAT(sq.question_text, subjects.display_name) AS question_text,
    ssq.display_priority,
    qt.name AS question_type,
    sub.response_id,
    sub.response_text,
    sub.response_display_priority,
    sub.response_display_image,
    surveys.id AS survey_id,
    survey_types.id AS survey_type_id
FROM
    surveys_context
    JOIN surveys ON survey_id = surveys.id
    JOIN survey_types ON surveys_context.survey_type_id = survey_types.id
    JOIN subjects ON subject_id = subjects.id
    JOIN surveys_survey_questions ssq ON ssq.survey_id = surveys.id
    JOIN survey_questions sq ON ssq.survey_question_id = sq.id
    JOIN question_types qt ON qt.id = sq.question_type_id
    JOIN upchieve.survey_types st ON st.id = surveys_context.survey_type_id
    JOIN LATERAL (
        SELECT
            id AS response_id,
            choice_text AS response_text,
            display_priority AS response_display_priority,
            display_image AS response_display_image
        FROM
            survey_questions_response_choices sqrc
            JOIN survey_response_choices src ON src.id = sqrc.response_choice_id
        WHERE
            sqrc.surveys_survey_question_id = ssq.id) sub ON TRUE
WHERE
    subjects.name = :subjectName!
    AND st.name = :surveyType!;


/* @name getPresessionSurveyResponse */
SELECT
    FORMAT(sq.response_display_text, subjects.display_name) AS display_label,
    (
        CASE WHEN src.choice_text = 'Other'
            AND uss.open_response IS NULL THEN
            'Other - ask them what their goal is!'
        WHEN src.choice_text = 'Other' THEN
            uss.open_response
        ELSE
            src.choice_text
        END) AS response,
    COALESCE(src.score, 0) AS score,
    ssq.display_priority AS display_order,
    src.display_image AS display_image
FROM
    users_surveys AS us
    JOIN sessions AS s ON s.student_id = us.user_id
    JOIN subjects ON s.subject_id = subjects.id
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


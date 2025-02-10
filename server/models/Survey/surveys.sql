/* @name saveUserSurvey */
INSERT INTO users_surveys (id, survey_id, user_id, session_id, progress_report_id, survey_type_id, created_at, updated_at)
SELECT
    generate_ulid (),
    :surveyId!,
    :userId!,
    :sessionId,
    :progressReportId,
    :surveyTypeId!,
    NOW(),
    NOW()
ON CONFLICT (survey_id,
    user_id,
    session_id,
    survey_type_id)
    DO UPDATE SET
        updated_at = NOW()
    RETURNING
        id,
        survey_id,
        user_id,
        session_id,
        progress_report_id,
        survey_type_id,
        created_at,
        updated_at;


/* @name saveUserSurveySubmissions */
INSERT INTO users_surveys_submissions (user_survey_id, survey_question_id, survey_response_choice_id, open_response, created_at, updated_at)
SELECT
    :userSurveyId!,
    :questionId!,
    :responseChoiceId,
    :openResponse,
    NOW(),
    NOW()
RETURNING
    user_survey_id AS ok;


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


/* @name getSimpleSurveyDefinition */
WITH most_recent_survey AS (
    SELECT
        surveys.id,
        surveys_context.subject_id,
        surveys_context.survey_type_id,
        subjects.display_name AS subject_display_name,
        surveys.reward_amount,
        surveys.created_at
    FROM
        surveys
        JOIN surveys_context ON surveys.id = surveys_context.survey_id
        JOIN survey_types ON surveys_context.survey_type_id = survey_types.id
        LEFT JOIN subjects ON surveys_context.subject_id = subjects.id
    WHERE (:surveyId::int IS NULL
        OR surveys.id = :surveyId::int)
    AND (:surveyType::text IS NULL
        OR survey_types.name = :surveyType::text)
    AND (:subjectName::text IS NULL
        OR subjects.name = :subjectName::text)
ORDER BY
    surveys.created_at DESC
LIMIT 1
)
SELECT
    sq.id::int AS question_id,
    FORMAT(sq.question_text, most_recent_survey.subject_display_name) AS question_text,
    ssq.display_priority,
    qt.name AS question_type,
    sub.response_id::int,
    sub.response_text,
    sub.response_display_priority,
    sub.response_display_image,
    most_recent_survey.id::int AS survey_id,
    most_recent_survey.survey_type_id,
    most_recent_survey.reward_amount
FROM
    most_recent_survey
    JOIN surveys_survey_questions ssq ON ssq.survey_id = most_recent_survey.id
    JOIN survey_questions sq ON ssq.survey_question_id = sq.id
    JOIN question_types qt ON qt.id = sq.question_type_id
    LEFT JOIN LATERAL (
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
ORDER BY
    ssq.display_priority ASC;


/* @name getPostsessionSurveyDefinitionForSession */
SELECT
    s.id AS survey_id,
    st.id AS survey_type_id,
    s.name,
    sq.id AS question_id,
    sq.question_text,
    ssq.display_priority,
    qt.name AS question_type,
    sq.replacement_column_1 AS first_replacement_column,
    sq.replacement_column_2 AS second_replacement_column,
    array_agg(json_build_object('responseId', src.id, 'responseText', src.choice_text, 'responseDisplayPriority', sqrc.display_priority, 'responseDisplayImage', src.display_image)) AS responses
FROM
    surveys_context sc
    JOIN surveys s ON s.id = sc.survey_id
    JOIN survey_types st ON st.id = sc.survey_type_id
    JOIN surveys_survey_questions ssq ON ssq.survey_id = s.id
    JOIN survey_questions sq ON sq.id = ssq.survey_question_id
    JOIN question_types qt ON qt.id = sq.question_type_id
    JOIN survey_questions_response_choices sqrc ON sqrc.surveys_survey_question_id = ssq.id
    JOIN survey_response_choices src ON src.id = sqrc.response_choice_id
    JOIN subjects ON sc.subject_id = subjects.id
    JOIN sessions sess ON sess.subject_id = subjects.id
    JOIN user_roles ur ON ur.id = s.role_id
WHERE
    sess.id = :sessionId!
    AND ur.name = :userRole!
    AND st.name = 'postsession'
GROUP BY
    s.id,
    st.id,
    sq.id,
    ssq.id,
    qt.id
ORDER BY
    ssq.display_priority ASC;


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
    src.display_image AS display_image,
    sq.id::int AS question_id,
    src.id AS response_id
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


/* @name getStudentPostsessionSurveyResponse */
WITH replacement_column_cte AS (
    SELECT
        sq.id,
        CASE WHEN sq.replacement_column_1 = 'student_name' THEN
            u_student.first_name
        WHEN sq.replacement_column_1 = 'student_goal'
            AND src.choice_text = 'Other' THEN
            COALESCE(uss.open_response, 'get help')
        WHEN sq.replacement_column_1 = 'student_goal'
            AND src.choice_text <> 'Other' THEN
            COALESCE(src.choice_text)
        WHEN sq.replacement_column_1 = 'coach_name' THEN
            u_volunteer.first_name
        WHEN sq.replacement_column_1 = 'subject_name' THEN
            subjects.display_name
        END AS replacement_text_1,
        CASE WHEN sq.replacement_column_2 = 'student_goal'
            AND src.choice_text = 'Other' THEN
            COALESCE(uss.open_response, 'get help')
        WHEN sq.replacement_column_2 = 'student_goal'
            AND src.choice_text <> 'OTHER' THEN
            COALESCE(src.choice_text)
        WHEN sq.replacement_column_2 = 'subject_name' THEN
            subjects.display_name
        END AS replacement_text_2
    FROM
        upchieve.sessions s
        JOIN upchieve.subjects ON s.subject_id = subjects.id
        JOIN upchieve.surveys_context sc ON sc.subject_id = s.subject_id
        JOIN upchieve.survey_types st ON st.id = sc.survey_type_id
        JOIN upchieve.surveys_survey_questions ssq ON ssq.survey_id = sc.survey_id
        JOIN upchieve.survey_questions sq ON ssq.survey_question_id = sq.id
        JOIN upchieve.users u_student ON u_student.id = s.student_id
        JOIN upchieve.users u_volunteer ON u_volunteer.id = s.volunteer_id
        JOIN upchieve.users_surveys us ON us.session_id = s.id
        JOIN upchieve.users_surveys_submissions uss ON us.id = uss.user_survey_id
        JOIN upchieve.survey_response_choices src ON uss.survey_response_choice_id = src.id
        JOIN upchieve.survey_questions sq_goal ON uss.survey_question_id = sq_goal.id
            AND sq_goal.question_text = 'What is your primary goal for today''s session?'
        JOIN upchieve.surveys ON sc.survey_id = surveys.id
        JOIN upchieve.user_roles ur ON ur.id = surveys.role_id
    WHERE
        st.name = 'postsession'
        AND s.id = :sessionId!
        AND ur.name = 'student'
)
SELECT
    'student' AS user_role,
    sq.question_text,
    FORMAT(sq.question_text, rcc.replacement_text_1, rcc.replacement_text_2) AS display_label,
    (
        CASE WHEN (src.choice_text = 'Other'
            OR qt.name = 'free response') THEN
            uss.open_response
        ELSE
            src.choice_text
        END) AS response,
    COALESCE(src.score, 0) AS score,
    ssq.display_priority AS display_order
FROM
    upchieve.users_surveys AS us
    JOIN upchieve.sessions AS s ON s.student_id = us.user_id
    JOIN upchieve.subjects ON s.subject_id = subjects.id
    JOIN upchieve.survey_types AS st ON us.survey_type_id = st.id
    JOIN upchieve.users_surveys_submissions AS uss ON us.id = uss.user_survey_id
    LEFT JOIN upchieve.survey_response_choices AS src ON uss.survey_response_choice_id = src.id
    JOIN upchieve.survey_questions AS sq ON uss.survey_question_id = sq.id
    LEFT JOIN upchieve.surveys_survey_questions AS ssq ON us.survey_id = ssq.survey_id
        AND uss.survey_question_id = ssq.survey_question_id
    LEFT JOIN upchieve.question_types AS qt ON qt.id = sq.question_type_id
    JOIN replacement_column_cte rcc ON rcc.id = sq.id
WHERE
    us.session_id = :sessionId!
    AND s.id = :sessionId!
    AND st.name = 'postsession'
ORDER BY
    ssq.display_priority ASC;


/* @name getVolunteerPostsessionSurveyResponse */
WITH replacement_column_cte AS (
    SELECT
        sq.id,
        CASE WHEN sq.replacement_column_1 = 'student_name' THEN
            u_student.first_name
        WHEN sq.replacement_column_1 = 'student_goal'
            AND src.choice_text = 'Other' THEN
            COALESCE(uss.open_response, 'get help')
        WHEN sq.replacement_column_1 = 'student_goal'
            AND src.choice_text <> 'Other' THEN
            COALESCE(src.choice_text)
        WHEN sq.replacement_column_1 = 'coach_name' THEN
            u_volunteer.first_name
        WHEN sq.replacement_column_1 = 'subject_name' THEN
            subjects.display_name
        END AS replacement_text_1,
        CASE WHEN sq.replacement_column_2 = 'student_goal'
            AND src.choice_text = 'Other' THEN
            COALESCE(uss.open_response, 'get help')
        WHEN sq.replacement_column_2 = 'student_goal'
            AND src.choice_text <> 'OTHER' THEN
            COALESCE(src.choice_text)
        WHEN sq.replacement_column_2 = 'subject_name' THEN
            subjects.display_name
        END AS replacement_text_2
    FROM
        upchieve.sessions s
        JOIN upchieve.subjects ON s.subject_id = subjects.id
        JOIN upchieve.surveys_context sc ON sc.subject_id = s.subject_id
        JOIN upchieve.survey_types st ON st.id = sc.survey_type_id
        JOIN upchieve.surveys_survey_questions ssq ON ssq.survey_id = sc.survey_id
        JOIN upchieve.survey_questions sq ON ssq.survey_question_id = sq.id
        JOIN upchieve.users u_student ON u_student.id = s.student_id
        JOIN upchieve.users u_volunteer ON u_volunteer.id = s.volunteer_id
        JOIN upchieve.users_surveys us ON us.session_id = s.id
        JOIN upchieve.users_surveys_submissions uss ON us.id = uss.user_survey_id
        JOIN upchieve.survey_response_choices src ON uss.survey_response_choice_id = src.id
        JOIN upchieve.survey_questions sq_goal ON uss.survey_question_id = sq_goal.id
            AND sq_goal.question_text = 'What is your primary goal for today''s session?'
        JOIN upchieve.surveys ON sc.survey_id = surveys.id
        JOIN upchieve.user_roles ur ON ur.id = surveys.role_id
    WHERE
        st.name = 'postsession'
        AND s.id = :sessionId!
        AND ur.name = 'volunteer'
)
SELECT
    'volunteer' AS user_role,
    sq.question_text,
    FORMAT(sq.question_text, rcc.replacement_text_1, rcc.replacement_text_2) AS display_label,
    (
        CASE WHEN (src.choice_text = 'Other'
            OR qt.name = 'free response') THEN
            uss.open_response
        ELSE
            src.choice_text
        END) AS response,
    COALESCE(src.score, 0) AS score,
    ssq.display_priority AS display_order
FROM
    upchieve.users_surveys AS us
    JOIN upchieve.sessions AS s ON s.volunteer_id = us.user_id
    JOIN upchieve.subjects ON s.subject_id = subjects.id
    JOIN upchieve.survey_types AS st ON us.survey_type_id = st.id
    JOIN upchieve.users_surveys_submissions AS uss ON us.id = uss.user_survey_id
    LEFT JOIN upchieve.survey_response_choices AS src ON uss.survey_response_choice_id = src.id
    JOIN upchieve.survey_questions AS sq ON uss.survey_question_id = sq.id
    LEFT JOIN upchieve.surveys_survey_questions AS ssq ON us.survey_id = ssq.survey_id
        AND uss.survey_question_id = ssq.survey_question_id
    LEFT JOIN upchieve.question_types AS qt ON qt.id = sq.question_type_id
    JOIN replacement_column_cte rcc ON rcc.id = sq.id
WHERE
    us.session_id = :sessionId!
    AND s.id = :sessionId!
    AND st.name = 'postsession'
ORDER BY
    ssq.display_priority ASC;


/* @name getStudentSessionRating */
SELECT
    score
FROM
    upchieve.users_surveys
    JOIN upchieve.users_surveys_submissions uss ON users_surveys.id = uss.user_survey_id
    JOIN upchieve.survey_questions sq ON uss.survey_question_id = sq.id
    JOIN upchieve.survey_response_choices src ON uss.survey_response_choice_id = src.id
WHERE
    users_surveys.session_id = :sessionId!
    AND sq.question_text = 'Your goal for this session was to %s. Did UPchieve help you achieve your goal?';


/* @name getVolunteerSessionRating */
SELECT
    score
FROM
    upchieve.users_surveys
    JOIN upchieve.users_surveys_submissions uss ON users_surveys.id = uss.user_survey_id
    JOIN upchieve.survey_questions sq ON uss.survey_question_id = sq.id
    JOIN upchieve.survey_response_choices src ON uss.survey_response_choice_id = src.id
WHERE
    users_surveys.session_id = :sessionId!
    AND sq.question_text = '%s''s goal for this session was to %s. Were you able to help them achieve their goal?';


/* @name deleteDuplicateUserSurveys */
DELETE FROM upchieve.users_surveys
WHERE id IN (
        SELECT
            id
        FROM (
            SELECT
                id,
                ROW_NUMBER() OVER (PARTITION BY user_id, session_id, survey_id, survey_type_id ORDER BY created_at DESC) AS row_num,
                created_at
            FROM
                users_surveys) t
        WHERE
            t.row_num > 1);


/* @name getProgressReportSurveyResponse */
WITH latest_users_surveys AS (
    SELECT
        us.user_id,
        us.progress_report_id,
        MAX(us.created_at) AS latest_created_at
    FROM
        upchieve.users_surveys us
    WHERE
        us.progress_report_id = :progressReportId!
    GROUP BY
        us.user_id,
        us.progress_report_id
)
SELECT
    us.id AS user_survey_id,
    FORMAT(sq.question_text) AS display_label,
    (
        CASE WHEN (src.choice_text = 'Other'
            AND qt.name = 'free response') THEN
            uss.open_response
        ELSE
            src.choice_text
        END) AS response,
    COALESCE(src.score, 0) AS score,
    ssq.display_priority AS display_order,
    src.display_image AS display_image,
    sq.id::int AS question_id,
    src.id AS response_id
FROM
    upchieve.users_surveys us
    INNER JOIN latest_users_surveys lus ON us.user_id = lus.user_id
        AND us.progress_report_id = lus.progress_report_id
        AND us.created_at = lus.latest_created_at
    JOIN upchieve.survey_types st ON us.survey_type_id = st.id
    JOIN upchieve.users_surveys_submissions uss ON us.id = uss.user_survey_id
    LEFT JOIN upchieve.survey_response_choices src ON uss.survey_response_choice_id = src.id
    JOIN upchieve.survey_questions sq ON uss.survey_question_id = sq.id
    LEFT JOIN upchieve.surveys_survey_questions ssq ON us.survey_id = ssq.survey_id
        AND uss.survey_question_id = ssq.survey_question_id
    LEFT JOIN upchieve.question_types qt ON qt.id = sq.question_type_id
WHERE
    st.name = 'progress-report'
    AND us.user_id = :userId!
ORDER BY
    ssq.display_priority ASC;


/* @name getStudentPostsessionSurveyGoalQuestionRatings */
SELECT
    s.id AS session_id,
    us.created_at,
    uss.survey_response_choice_id,
    src.score,
    src.choice_text
FROM
    sessions s
    JOIN upchieve.users_surveys us ON us.session_id = s.id
    JOIN upchieve.users_surveys_submissions uss ON us.id = uss.user_survey_id
    JOIN upchieve.survey_questions sq ON uss.survey_question_id = sq.id
    JOIN upchieve.survey_response_choices src ON uss.survey_response_choice_id = src.id
    JOIN upchieve.survey_types st ON st.id = us.survey_type_id
WHERE (s.student_id = :userId!
    OR s.volunteer_id = :userId!)
AND st.name = 'postsession'
AND sq.question_text = 'Your goal for this session was to %s. Did UPchieve help you achieve your goal?'
AND src.choice_text IN ('Not at all', 'Sorta but not really', 'I guess so', 'I''m def closer to my goal', 'GOAL ACHIEVED')
ORDER BY
    uss.created_at DESC;


/* @name getVolunteerPostsessionSurveyGoalQuestionRatings */
SELECT
    s.id AS session_id,
    us.created_at,
    uss.survey_response_choice_id,
    src.score,
    src.choice_text
FROM
    sessions s
    JOIN upchieve.users_surveys us ON us.session_id = s.id
    JOIN upchieve.users_surveys_submissions uss ON us.id = uss.user_survey_id
    JOIN upchieve.survey_questions sq ON uss.survey_question_id = sq.id
    JOIN upchieve.survey_response_choices src ON uss.survey_response_choice_id = src.id
    JOIN upchieve.survey_types st ON st.id = us.survey_type_id
WHERE (s.student_id = :userId!
    OR s.volunteer_id = :userId!)
AND st.name = 'postsession'
AND sq.question_text = '%s''s goal for this session was to %s. Were you able to help them achieve their goal?'
AND src.choice_text IN ('Not at all', 'Sorta but not really', 'Somewhat', 'Mostly', 'A lot');


/* @name getLatestUserSubmissionsForSurvey */
WITH most_recent_survey_submission AS (
    SELECT
        users_surveys.id,
        users_surveys.survey_id,
        users_surveys.created_at
    FROM
        users_surveys
        JOIN survey_types ON users_surveys.survey_type_id = survey_types.id
    WHERE
        users_surveys.user_id = :userId!::uuid
        AND (:surveyId::int IS NULL
            OR users_surveys.survey_id = :surveyId::int)
        AND (:surveyType::text IS NULL
            OR survey_types.name = :surveyType::text)
    ORDER BY
        users_surveys.created_at DESC
    LIMIT 1
)
SELECT
    sq.question_text AS display_label,
    (
        CASE WHEN src.choice_text = 'Other'
            OR uss.open_response IS NOT NULL THEN
            uss.open_response
        ELSE
            src.choice_text
        END) AS response,
    COALESCE(src.score, 0) AS score,
    ssq.display_priority AS display_order,
    sq.id::int AS question_id,
    src.id::int AS response_id
FROM
    most_recent_survey_submission mrss
    JOIN users_surveys_submissions uss ON mrss.id = uss.user_survey_id
    JOIN survey_questions sq ON uss.survey_question_id = sq.id
    LEFT JOIN surveys_survey_questions ssq ON uss.survey_question_id = ssq.survey_question_id
        AND mrss.survey_id = ssq.survey_id
    LEFT JOIN survey_response_choices src ON uss.survey_response_choice_id = src.id
ORDER BY
    ssq.display_priority ASC;


/* @name getSurveyIdForLatestImpactStudySurveySubmission */
SELECT
    users_surveys.survey_id
FROM
    users_surveys
    JOIN survey_types ON users_surveys.survey_type_id = survey_types.id
WHERE
    users_surveys.user_id = :userId!::uuid
    AND survey_types.name = 'impact-study'
ORDER BY
    users_surveys.created_at DESC
LIMIT 1;


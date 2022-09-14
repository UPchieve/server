-- migrate:up
INSERT INTO upchieve.survey_types (name, created_at, updated_at)
    VALUES ('postsession', NOW(), NOW())
ON CONFLICT ON CONSTRAINT survey_types_name_key
    DO NOTHING;

INSERT INTO upchieve.surveys (name, created_at, updated_at)
    VALUES ('Student Post-Session Survey', NOW(), NOW())
ON CONFLICT ON CONSTRAINT surveys_name_key
    DO NOTHING;

INSERT INTO upchieve.survey_questions (question_type_id, question_text, created_at, updated_at)
SELECT
    upchieve.question_types.id,
    sub.text,
    NOW(),
    NOW()
FROM
    upchieve.question_types
    JOIN UNNEST(ARRAY['Your goal for this session was to %s. Did UPchieve help you achieve your goal?', 'Sorry to hear that, what happened?', 'Would you like to favorite your coach %s?', 'Overall, how supportive was your coach today?', 'Overall, how much did your coach push you to do your best work today?']) AS sub ON TRUE
WHERE
    upchieve.question_types.name = 'multiple choice';

INSERT INTO upchieve.survey_questions (question_type_id, question_text, created_at, updated_at)
SELECT
    upchieve.question_types.id,
    sub.text,
    NOW(),
    NOW()
FROM
    upchieve.question_types
    JOIN UNNEST(ARRAY['This can be about the web app, the Academic Coach who helped you, the services UPchieve offers, etc.']) AS sub ON TRUE
WHERE
    upchieve.question_types.name = 'free response';

INSERT INTO upchieve.survey_response_choices (score, choice_text, created_at, updated_at)
    VALUES (1, 'Not at all', NOW(), NOW()), (2, 'Sorta but not really', NOW(), NOW()), (3, 'I guess so', NOW(), NOW()), (4, 'I''m def closer to my goal', NOW(), NOW()), (5, 'GOAL ACHIEVED', NOW(), NOW()), (3, 'Somewhat', NOW(), NOW()), (4, 'Mostly', NOW(), NOW()), (5, 'Extremely', NOW(), NOW()), (5, 'A lot', NOW(), NOW()), (0, 'Rude coach', NOW(), NOW()), (0, 'Coach didn''t know topic', NOW(), NOW()), (0, 'Coach slow to respond', NOW(), NOW()), (0, 'Ran out of time', NOW(), NOW()), (0, 'Tech issue', NOW(), NOW()), (0, 'Other', NOW(), NOW()), (0, 'Yes', NOW(), NOW()), (0, 'Maybe later', NOW(), NOW());

INSERT INTO upchieve.surveys_survey_questions (survey_id, survey_question_id, display_priority, created_at, updated_at)
SELECT
    upchieve.surveys.id,
    upchieve.survey_questions.id,
    sub.text::int,
    NOW(),
    NOW()
FROM
    upchieve.surveys
    JOIN upchieve.survey_questions ON TRUE
    JOIN UNNEST(ARRAY[10, 20, 30, 40, 50, 60, 70, 80, 90, 100]) AS sub ON TRUE
WHERE (upchieve.surveys.name = 'Student Post-Session Survey'
    AND upchieve.survey_questions.question_text = 'Your goal for this session was to %s. Did UPchieve help you achieve your goal?'
    AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND upchieve.survey_questions.question_text = 'Sorry to hear that, what happened?'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND upchieve.survey_questions.question_text = 'Would you like to favorite your coach %s?'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND upchieve.survey_questions.question_text = 'Overall, how supportive was your coach today?'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND upchieve.survey_questions.question_text = 'Overall, how much did your coach push you to do your best work today?'
        AND sub.text::int = 50)
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND upchieve.survey_questions.question_text = 'This can be about the web app, the Academic Coach who helped you, the services UPchieve offers, etc.'
        AND sub.text::int = 60);

INSERT INTO upchieve.survey_questions_response_choices (surveys_survey_question_id, response_choice_id, display_priority, created_at, updated_at)
SELECT
    ssq.id,
    rc.id,
    sub.text::int,
    NOW(),
    NOW()
FROM
    upchieve.surveys_survey_questions ssq
    JOIN upchieve.survey_response_choices rc ON TRUE
    JOIN upchieve.surveys ON upchieve.surveys.id = ssq.survey_id
    JOIN upchieve.survey_questions sq ON sq.id = ssq.survey_question_id
    JOIN UNNEST(ARRAY[10, 20, 30, 40, 50, 60, 70, 80, 90, 100]) AS sub ON TRUE
WHERE (upchieve.surveys.name = 'Student Post-Session Survey'
    AND sq.question_text = 'Your goal for this session was to %s. Did UPchieve help you achieve your goal?'
    AND rc.choice_text = 'Not at all'
    AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND sq.question_text = 'Your goal for this session was to %s. Did UPchieve help you achieve your goal?'
        AND rc.choice_text = 'Sorta but not really'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND sq.question_text = 'Your goal for this session was to %s. Did UPchieve help you achieve your goal?'
        AND rc.choice_text = 'I guess so'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND sq.question_text = 'Your goal for this session was to %s. Did UPchieve help you achieve your goal?'
        AND rc.choice_text = 'I''m def closer to my goal'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND sq.question_text = 'Your goal for this session was to %s. Did UPchieve help you achieve your goal?'
        AND rc.choice_text = 'GOAL ACHIEVED'
        AND sub.text::int = 50)
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND sq.question_text = 'Sorry to hear that, what happened?'
        AND rc.choice_text = 'Rude coach'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND sq.question_text = 'Sorry to hear that, what happened?'
        AND rc.choice_text = 'Coach didn''t know topic'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND sq.question_text = 'Sorry to hear that, what happened?'
        AND rc.choice_text = 'Coach slow to respond'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND sq.question_text = 'Sorry to hear that, what happened?'
        AND rc.choice_text = 'Ran out of time'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND sq.question_text = 'Sorry to hear that, what happened?'
        AND rc.choice_text = 'Tech issue'
        AND sub.text::int = 50)
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND sq.question_text = 'Sorry to hear that, what happened?'
        AND rc.choice_text = 'Other'
        AND sub.text::int = 60)
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND sq.question_text = 'Would you like to favorite your coach %s?'
        AND rc.choice_text = 'Yes'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND sq.question_text = 'Would you like to favorite your coach %s?'
        AND rc.choice_text = 'Maybe later'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND sq.question_text = 'Overall, how supportive was your coach today?'
        AND rc.choice_text = 'Not at all'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND sq.question_text = 'Overall, how supportive was your coach today?'
        AND rc.choice_text = 'Sorta but not really'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND sq.question_text = 'Overall, how supportive was your coach today?'
        AND rc.choice_text = 'Somewhat'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND sq.question_text = 'Overall, how supportive was your coach today?'
        AND rc.choice_text = 'Mostly'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND sq.question_text = 'Overall, how supportive was your coach today?'
        AND rc.choice_text = 'Extremely'
        AND sub.text::int = 50)
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND sq.question_text = 'Overall, how much did your coach push you to do your best work today?'
        AND rc.choice_text = 'Not at all'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND sq.question_text = 'Overall, how much did your coach push you to do your best work today?'
        AND rc.choice_text = 'Sorta but not really'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND sq.question_text = 'Overall, how much did your coach push you to do your best work today?'
        AND rc.choice_text = 'Somewhat'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND sq.question_text = 'Overall, how much did your coach push you to do your best work today?'
        AND rc.choice_text = 'Mostly'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND sq.question_text = 'Overall, how much did your coach push you to do your best work today?'
        AND rc.choice_text = 'A lot'
        AND sub.text::int = 50);

INSERT INTO upchieve.surveys_context (survey_id, subject_id, survey_type_id, created_at, updated_at)
SELECT
    upchieve.surveys.id,
    upchieve.subjects.id,
    upchieve.survey_types.id,
    NOW(),
    NOW()
FROM
    upchieve.surveys
    JOIN upchieve.subjects ON TRUE
    JOIN upchieve.survey_types ON TRUE
WHERE (upchieve.surveys.name = 'Student Post-Session Survey'
    AND upchieve.subjects.name = 'prealgebra'
    AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND upchieve.subjects.name = 'algebraOne'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND upchieve.subjects.name = 'algebraTwo'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND upchieve.subjects.name = 'geometry'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND upchieve.subjects.name = 'trigonometry'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND upchieve.subjects.name = 'precalculus'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND upchieve.subjects.name = 'calculusAB'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND upchieve.subjects.name = 'calculusBC'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND upchieve.subjects.name = 'statistics'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND upchieve.subjects.name = 'biology'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND upchieve.subjects.name = 'chemistry'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND upchieve.subjects.name = 'physicsOne'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND upchieve.subjects.name = 'physicsTwo'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND upchieve.subjects.name = 'environmentalScience'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND upchieve.subjects.name = 'integratedMathOne'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND upchieve.subjects.name = 'integratedMathTwo'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND upchieve.subjects.name = 'integratedMathThree'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND upchieve.subjects.name = 'integratedMathFour'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND upchieve.subjects.name = 'humanitiesEssays'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND upchieve.subjects.name = 'reading'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND upchieve.subjects.name = 'planning'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND upchieve.subjects.name = 'essays'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND upchieve.subjects.name = 'applications'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND upchieve.subjects.name = 'satMath'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND upchieve.subjects.name = 'satReading'
        AND upchieve.survey_types.name = 'postsession');

-- migrate:down
-- NOTE: run `truncate table upchieve.users_surveys` if this down migration fails
DELETE FROM upchieve.surveys
WHERE upchieve.surveys.name = 'Student Post-Session Survey';

DELETE FROM upchieve.survey_questions
WHERE upchieve.survey_questions.question_text IN ('Your goal for this session was to %s. Did UPchieve help you achieve your goal?', 'Sorry to hear that, what happened?', 'Would you like to favorite your coach %s?', 'Overall, how supportive was your coach today?', 'Overall, how much did your coach push you to do your best work today?', 'This can be about the web app, the Academic Coach who helped you, the services UPchieve offers, etc.');

DELETE FROM upchieve.survey_response_choices
WHERE upchieve.survey_response_choices.choice_text IN ('Not at all', 'Sorta but not really', 'I guess so', 'I''m def closer to my goal', 'GOAL ACHIEVED', 'Somewhat', 'Mostly', 'Extremely', 'A lot', 'Rude coach', 'Coach didn''t know topic', 'Coach slow to respond', 'Ran out of time', 'Tech issue', 'Other', 'Yes', 'Maybe later');

-- DELETE FROM upchieve.surveys_survey_questions USING upchieve.surveys_context, upchieve.survey_types
--   WHERE upchieve.surveys_survey_questions.survey_id = upchieve.surveys_context.survey_id
--   AND upchieve.surveys_context.survey_type_id = upchieve.survey_types.id
--   AND upchieve.survey_types.name = 'postsession';
-- DELETE FROM upchieve.surveys_context USING upchieve.survey_types
--   WHERE upchieve.surveys_context.survey_type_id = upchieve.survey_types.id
--   AND upchieve.survey_types.name = 'postsession';

-- migrate:up
INSERT INTO upchieve.surveys (name, role_id, reward_amount, created_at, updated_at)
    VALUES ('Impact Study Survey 1.0', 1, 10, NOW(), NOW())
ON CONFLICT ON CONSTRAINT surveys_name_key
    DO NOTHING;

INSERT INTO upchieve.survey_types (name, created_at, updated_at)
    VALUES ('impact-study', NOW(), NOW())
ON CONFLICT ON CONSTRAINT survey_types_name_key
    DO NOTHING;

INSERT INTO upchieve.surveys_context (survey_id, subject_id, survey_type_id, created_at, updated_at)
SELECT
    upchieve.surveys.id,
    NULL,
    upchieve.survey_types.id,
    NOW(),
    NOW()
FROM
    upchieve.surveys
    JOIN upchieve.survey_types ON TRUE
WHERE (upchieve.surveys.name = 'Impact Study Survey 1.0'
    AND upchieve.survey_types.name = 'impact-study');

INSERT INTO upchieve.survey_questions (question_type_id, question_text, created_at, updated_at)
SELECT
    upchieve.question_types.id,
    sub.text,
    NOW(),
    NOW()
FROM
    upchieve.question_types
    JOIN UNNEST(ARRAY['What''s your GPA right now?', 'What''s your lowest grade this semester?', 'Where do you hope to go to college?']) AS sub ON TRUE
WHERE
    upchieve.question_types.name = 'free response';

INSERT INTO upchieve.survey_questions (question_type_id, question_text, created_at, updated_at)
SELECT
    id,
    'How confident are you about getting in?',
    NOW(),
    NOW()
FROM
    upchieve.question_types
WHERE
    name = 'multiple choice';

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
    JOIN UNNEST(ARRAY[10, 20, 30, 40]) AS sub ON TRUE
WHERE (upchieve.surveys.name = 'Impact Study Survey 1.0'
    AND upchieve.survey_questions.question_text = 'What''s your GPA right now?'
    AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'Impact Study Survey 1.0'
        AND upchieve.survey_questions.question_text = 'What''s your lowest grade this semester?'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'Impact Study Survey 1.0'
        AND upchieve.survey_questions.question_text = 'Where do you hope to go to college?'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'Impact Study Survey 1.0'
        AND upchieve.survey_questions.question_text = 'How confident are you about getting in?'
        AND sub.text::int = 40);

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
    JOIN UNNEST(ARRAY[10, 20, 30, 40, 50]) AS sub ON TRUE
WHERE (upchieve.surveys.name = 'Impact Study Survey 1.0'
    AND sq.question_text = 'How confident are you about getting in?'
    AND rc.choice_text = 'Stressed'
    AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'How confident are you about getting in?'
        AND rc.choice_text = 'Nervous'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'How confident are you about getting in?'
        AND rc.choice_text = 'Neutral'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'How confident are you about getting in?'
        AND rc.choice_text = 'Optimistic'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'How confident are you about getting in?'
        AND rc.choice_text = 'Confident'
        AND sub.text::int = 50);

-- migrate:down
DELETE FROM upchieve.surveys
WHERE upchieve.surveys.name = 'Impact Study Survey 1.0';

DELETE FROM upchieve.survey_types
WHERE upchieve.survey_types.name = 'impact-study';

DELETE FROM upchieve.surveys_context USING upchieve.surveys
WHERE upchieve.surveys_context.survey_id = surveys.id
    AND surveys.name = 'Impact Study Survey 1.0';

DELETE FROM upchieve.survey_questions
WHERE question_text = 'What''s your GPA right now?'
    OR question_text = 'What''s your lowest grade this semester?'
    OR question_text = 'Where do you hope to go to college?'
    OR question_text = 'How confident are you about getting in?';

DELETE FROM upchieve.surveys_survey_questions USING upchieve.surveys
WHERE upchieve.surveys_survey_questions.id = upchieve.surveys_survey_questions.id
    AND upchieve.surveys_survey_questions.survey_id = upchieve.surveys.id
    AND surveys.name = 'Impact Study Survey 1.0';


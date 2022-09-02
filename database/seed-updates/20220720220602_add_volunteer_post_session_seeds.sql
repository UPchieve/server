-- migrate:up
INSERT INTO upchieve.surveys (name, created_at, updated_at)
    VALUES ('General Volunteer Post-Session Survey', NOW(), NOW()), ('SAT Prep Volunteer Post-Session Survey', NOW(), NOW()), ('College Counseling Post-Session Survey', NOW(), NOW())
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
    JOIN UNNEST(ARRAY['%s''s goal for this session was to %s. Were you able to help them achieve their goal?', 'How do you think %s feels about %s at the end of this session?', 'How do you think %s feels about the %s at the end of this session?', 'How do you think %s feels about applying to college at the end of this session?', 'Were there any student safety, academic integrity, or community guideline issues during this session?', 'Please select all that apply']) AS sub ON TRUE
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
    JOIN UNNEST(ARRAY['This can be about the web app, the student you helped, technical issues, etc.']) AS sub ON TRUE
WHERE
    upchieve.question_types.name = 'free response';

INSERT INTO upchieve.survey_response_choices (score, choice_text, created_at, updated_at)
    VALUES (0, 'Yes', NOW(), NOW()), (0, 'No', NOW(), NOW()), (0, 'I didn''t know topic', NOW(), NOW()), (0, 'Wrong subject', NOW(), NOW()), (0, 'Student participation', NOW(), NOW());

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
WHERE (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
    AND upchieve.survey_questions.question_text = '%s''s goal for this session was to %s. Were you able to help them achieve their goal?'
    AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND upchieve.survey_questions.question_text = 'How do you think %s feels about %s at the end of this session?'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND upchieve.survey_questions.question_text = 'Were there any student safety, academic integrity, or community guideline issues during this session?'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND upchieve.survey_questions.question_text = 'Please select all that apply'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND upchieve.survey_questions.question_text = 'This can be about the web app, the student you helped, technical issues, etc.'
        AND sub.text::int = 50)
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND upchieve.survey_questions.question_text = '%s''s goal for this session was to %s. Were you able to help them achieve their goal?'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND upchieve.survey_questions.question_text = 'How do you think %s feels about the %s at the end of this session?'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND upchieve.survey_questions.question_text = 'Were there any student safety, academic integrity, or community guideline issues during this session?'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND upchieve.survey_questions.question_text = 'Please select all that apply'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND upchieve.survey_questions.question_text = 'This can be about the web app, the student you helped, technical issues, etc.'
        AND sub.text::int = 50);

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
WHERE (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
    AND sq.question_text = '%s''s goal for this session was to %s. Were you able to help them achieve their goal?'
    AND rc.choice_text = 'Not at all'
    AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND sq.question_text = '%s''s goal for this session was to %s. Were you able to help them achieve their goal?'
        AND rc.choice_text = 'Sorta but not really'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND sq.question_text = '%s''s goal for this session was to %s. Were you able to help them achieve their goal?'
        AND rc.choice_text = 'Somewhat'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND sq.question_text = '%s''s goal for this session was to %s. Were you able to help them achieve their goal?'
        AND rc.choice_text = 'Mostly'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND sq.question_text = '%s''s goal for this session was to %s. Were you able to help them achieve their goal?'
        AND rc.choice_text = 'A lot'
        AND sub.text::int = 50)
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND sq.question_text = 'How do you think %s feels about %s at the end of this session?'
        AND rc.choice_text = 'Stressed'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND sq.question_text = 'How do you think %s feels about %s at the end of this session?'
        AND rc.choice_text = 'Nervous'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND sq.question_text = 'How do you think %s feels about %s at the end of this session?'
        AND rc.choice_text = 'Neutral'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND sq.question_text = 'How do you think %s feels about %s at the end of this session?'
        AND rc.choice_text = 'Optimistic'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND sq.question_text = 'How do you think %s feels about %s at the end of this session?'
        AND rc.choice_text = 'Confident'
        AND sub.text::int = 50)
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND sq.question_text = 'Were there any student safety, academic integrity, or community guideline issues during this session?'
        AND rc.choice_text = 'Yes'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND sq.question_text = 'Were there any student safety, academic integrity, or community guideline issues during this session?'
        AND rc.choice_text = 'No'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND sq.question_text = 'Please select all that apply'
        AND rc.choice_text = 'Tech issues'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND sq.question_text = 'Please select all that apply'
        AND rc.choice_text = 'Ran out of time'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND sq.question_text = 'Please select all that apply'
        AND rc.choice_text = 'I didn''t know topic'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND sq.question_text = 'Please select all that apply'
        AND rc.choice_text = 'Wrong subject'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND sq.question_text = 'Please select all that apply'
        AND rc.choice_text = 'Student participation'
        AND sub.text::int = 50)
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND sq.question_text = 'Please select all that apply'
        AND rc.choice_text = 'Other'
        AND sub.text::int = 60)
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND sq.question_text = '%s''s goal for this session was to %s. Were you able to help them achieve their goal?'
        AND rc.choice_text = 'Not at all'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND sq.question_text = '%s''s goal for this session was to %s. Were you able to help them achieve their goal?'
        AND rc.choice_text = 'Sorta but not really'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND sq.question_text = '%s''s goal for this session was to %s. Were you able to help them achieve their goal?'
        AND rc.choice_text = 'Somewhat'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND sq.question_text = '%s''s goal for this session was to %s. Were you able to help them achieve their goal?'
        AND rc.choice_text = 'Mostly'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND sq.question_text = '%s''s goal for this session was to %s. Were you able to help them achieve their goal?'
        AND rc.choice_text = 'A lot'
        AND sub.text::int = 50)
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND sq.question_text = 'How do you think %s feels about %s at the end of this session?'
        AND rc.choice_text = 'Stressed'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND sq.question_text = 'How do you think %s feels about %s at the end of this session?'
        AND rc.choice_text = 'Nervous'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND sq.question_text = 'How do you think %s feels about %s at the end of this session?'
        AND rc.choice_text = 'Neutral'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND sq.question_text = 'How do you think %s feels about %s at the end of this session?'
        AND rc.choice_text = 'Optimistic'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND sq.question_text = 'How do you think %s feels about %s at the end of this session?'
        AND rc.choice_text = 'Confident'
        AND sub.text::int = 50)
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND sq.question_text = 'Were there any student safety, academic integrity, or community guideline issues during this session?'
        AND rc.choice_text = 'Yes'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND sq.question_text = 'Were there any student safety, academic integrity, or community guideline issues during this session?'
        AND rc.choice_text = 'No'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND sq.question_text = 'Please select all that apply'
        AND rc.choice_text = 'Tech issues'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND sq.question_text = 'Please select all that apply'
        AND rc.choice_text = 'Ran out of time'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND sq.question_text = 'Please select all that apply'
        AND rc.choice_text = 'I didn''t know topic'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND sq.question_text = 'Please select all that apply'
        AND rc.choice_text = 'Wrong subject'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND sq.question_text = 'Please select all that apply'
        AND rc.choice_text = 'Student participation'
        AND sub.text::int = 50)
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND sq.question_text = 'Please select all that apply'
        AND rc.choice_text = 'Other'
        AND sub.text::int = 60);

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
WHERE (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
    AND upchieve.subjects.name = 'prealgebra'
    AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND upchieve.subjects.name = 'algebraOne'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND upchieve.subjects.name = 'algebraTwo'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND upchieve.subjects.name = 'geometry'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND upchieve.subjects.name = 'trigonometry'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND upchieve.subjects.name = 'precalculus'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND upchieve.subjects.name = 'calculusAB'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND upchieve.subjects.name = 'calculusBC'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND upchieve.subjects.name = 'statistics'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND upchieve.subjects.name = 'biology'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND upchieve.subjects.name = 'chemistry'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND upchieve.subjects.name = 'physicsOne'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND upchieve.subjects.name = 'physicsTwo'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND upchieve.subjects.name = 'environmentalScience'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND upchieve.subjects.name = 'integratedMathOne'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND upchieve.subjects.name = 'integratedMathTwo'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND upchieve.subjects.name = 'integratedMathThree'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND upchieve.subjects.name = 'integratedMathFour'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND upchieve.subjects.name = 'humanitiesEssays'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND upchieve.subjects.name = 'reading'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND upchieve.subjects.name = 'satMath'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND upchieve.subjects.name = 'satReading'
        AND upchieve.survey_types.name = 'postsession');

-- migrate:down
DELETE FROM upchieve.surveys
WHERE upchieve.surveys.name IN ('General Volunteer Post-Session Survey', 'College Counseling Post-Session Survey', 'SAT Prep Volunteer Post-Session Survey');

DELETE FROM upchieve.survey_questions
WHERE upchieve.survey_questions.question_text IN ('%s''s goal for this session was to %s. Were you able to help them achieve their goal?', 'How do you think %s feels about %s at the end of this session?', 'How do you think %s feels about the %s at the end of this session?', 'How do you think %s feels about applying to college at the end of this session?', 'Were there any student safety, academic integrity, or community guideline issues during this session?', 'Please select all that apply', 'This can be about the web app, the student you helped, technical issues, etc.');

DELETE FROM upchieve.survey_response_choices
WHERE upchieve.survey_response_choices.choice_text IN ('No', 'I didn''t know topic', 'Wrong subject', 'Student participation');

DELETE FROM upchieve.surveys_survey_questions USING upchieve.surveys
WHERE upchieve.surveys_survey_questions.survey_id = upchieve.surveys.id
    AND (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        OR upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        OR upchieve.surveys.name = 'College Counseling Post-Session Survey');

DELETE FROM upchieve.survey_questions_response_choices USING upchieve.surveys_survey_questions, upchieve.surveys
WHERE upchieve.surveys_survey_questions.id = upchieve.surveys_survey_questions.id
    AND upchieve.surveys_survey_questions.survey_id = upchieve.surveys.id
    AND (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        OR upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        OR upchieve.surveys.name = 'College Counseling Post-Session Survey');

DELETE FROM upchieve.surveys_context USING upchieve.surveys
WHERE upchieve.surveys_context.survey_id = upchieve.surveys.id
    AND (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        OR upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        OR upchieve.surveys.name = 'College Counseling Post-Session Survey');


-- migrate:up
DELETE FROM upchieve.surveys_survey_questions USING upchieve.surveys
WHERE upchieve.surveys_survey_questions.survey_id = upchieve.surveys.id
    AND upchieve.surveys.name = 'Impact Study Survey 1.0';

INSERT INTO upchieve.survey_questions (question_type_id, question_text, created_at, updated_at)
SELECT
    qt.id,
    sub.text,
    NOW(),
    NOW()
FROM
    upchieve.question_types qt
    CROSS JOIN UNNEST(ARRAY['What course is your lowest grade in (please be specific in the course name)?', 'How many AP courses are you taking this year?', 'How many IB courses are you taking this year?', 'How many Dual enrollment courses are you taking this year?', 'How many Honors courses are you taking this year?']) AS sub (text)
WHERE
    qt.name = 'free response';

INSERT INTO upchieve.survey_questions (question_type_id, question_text, created_at, updated_at)
SELECT
    qt.id,
    sub.text,
    NOW(),
    NOW()
FROM
    upchieve.question_types qt
    CROSS JOIN UNNEST(ARRAY['What is your closest estimate of your current grades in school?', 'What is your lowest grade?', 'What subject is your lowest grade in?', 'Will you be the first person in your family to attend college?', 'Are you or have you ever been eligible for free or reduced price lunch at school?', 'Do you primarily speak English at home?', 'Do you have an IEP or 504 plan?']) AS sub (text)
WHERE
    qt.name = 'multiple choice';

INSERT INTO upchieve.survey_questions (question_type_id, question_text, created_at, updated_at)
SELECT
    qt.id,
    'What is your ethnicity? (Select all that apply)',
    NOW(),
    NOW()
FROM
    upchieve.question_types qt
WHERE
    qt.name = 'check box';

INSERT INTO upchieve.survey_response_choices (score, choice_text, created_at, updated_at)
    VALUES (0, 'I''m not sure / Prefer not to answer', NOW(), NOW()), (0, 'A''s', NOW(), NOW()), (0, 'A''s and B''s', NOW(), NOW()), (0, 'B''s', NOW(), NOW()), (0, 'B''s and C''s', NOW(), NOW()), (0, 'C''s', NOW(), NOW()), (0, 'C''s and D''s', NOW(), NOW()), (0, 'D''s', NOW(), NOW()), (0, 'D''s and below', NOW(), NOW()), (0, 'Math', NOW(), NOW()), (0, 'English', NOW(), NOW()), (0, 'Science', NOW(), NOW()), (0, 'Social Studies', NOW(), NOW()), (0, 'Foreign Language', NOW(), NOW()), (0, 'American Indian / Alaska Native', NOW(), NOW()), (0, 'Asian', NOW(), NOW()), (0, 'Black or African American', NOW(), NOW()), (0, 'Hispanic or Latinx', NOW(), NOW()), (0, 'Native Hawaiian / Pacific Islander', NOW(), NOW()), (0, 'Middle Eastern or North African', NOW(), NOW()), (0, 'White', NOW(), NOW()), (0, 'Prefer not to answer', NOW(), NOW());

INSERT INTO upchieve.surveys_survey_questions (survey_id, survey_question_id, display_priority, created_at, updated_at)
SELECT
    s.id,
    sq.id,
    CASE WHEN sq.question_text = 'What is your closest estimate of your current grades in school?' THEN
        10
    WHEN sq.question_text = 'What is your lowest grade?' THEN
        20
    WHEN sq.question_text = 'What subject is your lowest grade in?' THEN
        30
    WHEN sq.question_text = 'What course is your lowest grade in (please be specific in the course name)?' THEN
        40
    WHEN sq.question_text = 'How many AP courses are you taking this year?' THEN
        50
    WHEN sq.question_text = 'How many IB courses are you taking this year?' THEN
        60
    WHEN sq.question_text = 'How many Dual enrollment courses are you taking this year?' THEN
        70
    WHEN sq.question_text = 'How many Honors courses are you taking this year?' THEN
        80
    WHEN sq.question_text = 'What is your ethnicity? (Select all that apply)' THEN
        90
    WHEN sq.question_text = 'Will you be the first person in your family to attend college?' THEN
        100
    WHEN sq.question_text = 'Are you or have you ever been eligible for free or reduced price lunch at school?' THEN
        110
    WHEN sq.question_text = 'Do you primarily speak English at home?' THEN
        120
    WHEN sq.question_text = 'Do you have an IEP or 504 plan?' THEN
        130
    ELSE
        0
    END AS priority,
    NOW(),
    NOW()
FROM
    upchieve.surveys s
    JOIN upchieve.survey_questions sq ON sq.question_text IN ('What is your closest estimate of your current grades in school?', 'What is your lowest grade?', 'What subject is your lowest grade in?', 'What course is your lowest grade in (please be specific in the course name)?', 'How many AP courses are you taking this year?', 'How many IB courses are you taking this year?', 'How many Dual enrollment courses are you taking this year?', 'How many Honors courses are you taking this year?', 'What is your ethnicity? (Select all that apply)', 'Will you be the first person in your family to attend college?', 'Are you or have you ever been eligible for free or reduced price lunch at school?', 'Do you primarily speak English at home?', 'Do you have an IEP or 504 plan?')
WHERE
    s.name = 'Impact Study Survey 1.0';

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
    JOIN upchieve.surveys s ON s.id = ssq.survey_id
    JOIN upchieve.survey_questions sq ON sq.id = ssq.survey_question_id
    CROSS JOIN UNNEST(ARRAY[10, 20, 30, 40, 50, 60, 70, 80]) AS sub (text)
WHERE (s.name = 'Impact Study Survey 1.0'
    AND sq.question_text = 'What is your closest estimate of your current grades in school?'
    AND rc.choice_text = 'A''s'
    AND sub.text::int = 10)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your closest estimate of your current grades in school?'
        AND rc.choice_text = 'A''s and B''s'
        AND sub.text::int = 20)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your closest estimate of your current grades in school?'
        AND rc.choice_text = 'B''s'
        AND sub.text::int = 30)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your closest estimate of your current grades in school?'
        AND rc.choice_text = 'B''s and C''s'
        AND sub.text::int = 40)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your closest estimate of your current grades in school?'
        AND rc.choice_text = 'C''s'
        AND sub.text::int = 50)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your closest estimate of your current grades in school?'
        AND rc.choice_text = 'C''s and D''s'
        AND sub.text::int = 60)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your closest estimate of your current grades in school?'
        AND rc.choice_text = 'D''s'
        AND sub.text::int = 70)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your closest estimate of your current grades in school?'
        AND rc.choice_text = 'D''s and below'
        AND sub.text::int = 80)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your lowest grade?'
        AND rc.choice_text = 'A''s'
        AND sub.text::int = 10)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your lowest grade?'
        AND rc.choice_text = 'A''s and B''s'
        AND sub.text::int = 20)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your lowest grade?'
        AND rc.choice_text = 'B''s'
        AND sub.text::int = 30)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your lowest grade?'
        AND rc.choice_text = 'B''s and C''s'
        AND sub.text::int = 40)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your lowest grade?'
        AND rc.choice_text = 'C''s'
        AND sub.text::int = 50)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your lowest grade?'
        AND rc.choice_text = 'C''s and D''s'
        AND sub.text::int = 60)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your lowest grade?'
        AND rc.choice_text = 'D''s'
        AND sub.text::int = 70)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your lowest grade?'
        AND rc.choice_text = 'D''s and below'
        AND sub.text::int = 80)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What subject is your lowest grade in?'
        AND rc.choice_text = 'Math'
        AND sub.text::int = 10)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What subject is your lowest grade in?'
        AND rc.choice_text = 'English'
        AND sub.text::int = 20)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What subject is your lowest grade in?'
        AND rc.choice_text = 'Science'
        AND sub.text::int = 30)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What subject is your lowest grade in?'
        AND rc.choice_text = 'Social Studies'
        AND sub.text::int = 40)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What subject is your lowest grade in?'
        AND rc.choice_text = 'Foreign Language'
        AND sub.text::int = 50)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What subject is your lowest grade in?'
        AND rc.choice_text = 'Other'
        AND sub.text::int = 60)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'Will you be the first person in your family to attend college?'
        AND rc.choice_text = 'Yes'
        AND sub.text::int = 10)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'Will you be the first person in your family to attend college?'
        AND rc.choice_text = 'No'
        AND sub.text::int = 20)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'Will you be the first person in your family to attend college?'
        AND rc.choice_text = 'I''m not sure / Prefer not to answer'
        AND sub.text::int = 30)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'Are you or have you ever been eligible for free or reduced price lunch at school?'
        AND rc.choice_text = 'Yes'
        AND sub.text::int = 10)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'Are you or have you ever been eligible for free or reduced price lunch at school?'
        AND rc.choice_text = 'No'
        AND sub.text::int = 20)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'Are you or have you ever been eligible for free or reduced price lunch at school?'
        AND rc.choice_text = 'I''m not sure / Prefer not to answer'
        AND sub.text::int = 30)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'Do you primarily speak English at home?'
        AND rc.choice_text = 'Yes'
        AND sub.text::int = 10)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'Do you primarily speak English at home?'
        AND rc.choice_text = 'No'
        AND sub.text::int = 20)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'Do you primarily speak English at home?'
        AND rc.choice_text = 'I''m not sure / Prefer not to answer'
        AND sub.text::int = 30)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'Do you have an IEP or 504 plan?'
        AND rc.choice_text = 'Yes'
        AND sub.text::int = 10)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'Do you have an IEP or 504 plan?'
        AND rc.choice_text = 'No'
        AND sub.text::int = 20)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'Do you have an IEP or 504 plan?'
        AND rc.choice_text = 'I''m not sure / Prefer not to answer'
        AND sub.text::int = 30)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your ethnicity? (Select all that apply)'
        AND rc.choice_text = 'American Indian / Alaska Native'
        AND sub.text::int = 10)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your ethnicity? (Select all that apply)'
        AND rc.choice_text = 'Asian'
        AND sub.text::int = 20)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your ethnicity? (Select all that apply)'
        AND rc.choice_text = 'Black or African American'
        AND sub.text::int = 30)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your ethnicity? (Select all that apply)'
        AND rc.choice_text = 'Hispanic or Latinx'
        AND sub.text::int = 40)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your ethnicity? (Select all that apply)'
        AND rc.choice_text = 'Native Hawaiian / Pacific Islander'
        AND sub.text::int = 50)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your ethnicity? (Select all that apply)'
        AND rc.choice_text = 'Middle Eastern or North African'
        AND sub.text::int = 60)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your ethnicity? (Select all that apply)'
        AND rc.choice_text = 'White'
        AND sub.text::int = 70)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your ethnicity? (Select all that apply)'
        AND rc.choice_text = 'Prefer not to answer'
        AND sub.text::int = 80);

-- migrate:down
DELETE FROM upchieve.survey_questions_response_choices sqrc USING upchieve.surveys s
JOIN upchieve.surveys_survey_questions ssq ON ssq.survey_id = s.id
JOIN upchieve.survey_questions sq ON sq.id = ssq.survey_question_id
WHERE s.name = 'Impact Study Survey 1.0'
    AND sqrc.surveys_survey_question_id = ssq.id;

DELETE FROM upchieve.surveys_survey_questions ssq USING upchieve.surveys s
WHERE ssq.survey_id = s.id
    AND s.name = 'Impact Study Survey 1.0';

DELETE FROM upchieve.survey_response_choices
WHERE choice_text IN ('I''m not sure / Prefer not to answer', 'A''s', 'A''s and B''s', 'B''s', 'B''s and C''s', 'C''s', 'C''s and D''s', 'D''s', 'D''s and below', 'Math', 'English', 'Science', 'Social Studies', 'Foreign Language', 'American Indian / Alaska Native', 'Asian', 'Black or African American', 'Hispanic or Latinx', 'Native Hawaiian / Pacific Islander', 'Middle Eastern or North African', 'White', 'Prefer not to answer');

DELETE FROM upchieve.survey_questions
WHERE question_text IN ('What course is your lowest grade in (please be specific in the course name)?', 'How many AP courses are you taking this year?', 'How many IB courses are you taking this year?', 'How many Dual enrollment courses are you taking this year?', 'How many Honors courses are you taking this year?', 'What is your closest estimate of your current grades in school?', 'What is your lowest grade?', 'What subject is your lowest grade in?', 'Will you be the first person in your family to attend college?', 'Are you or have you ever been eligible for free or reduced price lunch at school?', 'Do you primarily speak English at home?', 'Do you have an IEP or 504 plan?', 'What is your ethnicity? (Select all that apply)');


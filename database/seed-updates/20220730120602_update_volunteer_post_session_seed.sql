-- migrate:up
-- deal with duplicate Yes values
WITH extra_yes_ids AS (
    SELECT
        ( SELECT DISTINCT
                response_choice_id
            FROM
                upchieve.survey_questions_response_choices AS sqrc
                JOIN upchieve.survey_response_choices ON survey_response_choices.id = sqrc.response_choice_id
            WHERE
                choice_text = 'Yes' offset 1 ROWS FETCH NEXT 1 ROWS ONLY))
DELETE FROM upchieve.survey_questions_response_choices sqrc USING extra_yes_ids
WHERE extra_yes_ids.response_choice_id = sqrc.response_choice_id;

WITH extra_yes_ids AS (
    SELECT
        (
            SELECT
                id
            FROM
                upchieve.survey_response_choices
            WHERE
                choice_text = 'Yes' offset 1 ROWS FETCH NEXT 1 ROWS ONLY))
DELETE FROM upchieve.survey_response_choices AS sqrc USING extra_yes_ids
WHERE extra_yes_ids.id = sqrc.id;

--rename things that had the wrong name
UPDATE
    upchieve.surveys
SET
    name = 'College Counseling Volunteer Post-Session Survey',
    updated_at = NOW()
WHERE
    name = 'College Counseling Post-Session Survey';

-- need to update things that had "please select all that apply" to use 'sorry to hear that, what happened'
UPDATE
    upchieve.surveys_survey_questions ssq
SET
    survey_question_id = (
        SELECT
            id
        FROM
            upchieve.survey_questions
        WHERE
            question_text = 'Sorry to hear that, what happened?')
WHERE
    survey_question_id = (
        SELECT
            id
        FROM
            upchieve.survey_questions
        WHERE
            question_text = 'Please select all that apply');

-- fix college counseling volunteer post-session survey stuff that didn't seed properly in add_volunteer_post_session_seeds
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
WHERE (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
    AND upchieve.survey_questions.question_text = '%s''s goal for this session was to %s. Were you able to help them achieve their goal?'
    AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
        AND upchieve.survey_questions.question_text = 'Sorry to hear that, what happened?'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
        AND upchieve.survey_questions.question_text = 'How do you think %s feels about applying to college at the end of this session?'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
        AND upchieve.survey_questions.question_text = 'Were there any student safety, academic integrity, or community guideline issues during this session?'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
        AND upchieve.survey_questions.question_text = 'This can be about the web app, the student you helped, technical issues, etc.'
        AND sub.text::int = 60);

DELETE FROM upchieve.survey_questions_response_choices USING upchieve.surveys_survey_questions, upchieve.surveys, upchieve.survey_questions, upchieve.survey_response_choices
WHERE upchieve.surveys_survey_questions.id = upchieve.survey_questions_response_choices.surveys_survey_question_id
    AND upchieve.surveys_survey_questions.survey_id = upchieve.surveys.id
    AND upchieve.survey_questions.id = upchieve.surveys_survey_questions.survey_question_id
    AND upchieve.survey_response_choices.id = survey_questions_response_choices.response_choice_id
    AND upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
    AND upchieve.survey_questions.question_text = 'Were there any student safety, academic integrity, or community guideline issues during this session?'
    AND upchieve.survey_response_choices.choice_text = 'Not at all';

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
WHERE (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
    AND sq.question_text = '%s''s goal for this session was to %s. Were you able to help them achieve their goal?'
    AND rc.choice_text = 'Not at all'
    AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
        AND sq.question_text = '%s''s goal for this session was to %s. Were you able to help them achieve their goal?'
        AND rc.choice_text = 'Sorta but not really'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
        AND sq.question_text = '%s''s goal for this session was to %s. Were you able to help them achieve their goal?'
        AND rc.choice_text = 'Somewhat'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
        AND sq.question_text = '%s''s goal for this session was to %s. Were you able to help them achieve their goal?'
        AND rc.choice_text = 'Mostly'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
        AND sq.question_text = '%s''s goal for this session was to %s. Were you able to help them achieve their goal?'
        AND rc.choice_text = 'A lot'
        AND sub.text::int = 50)
    OR (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
        AND sq.question_text = 'How do you think %s feels about applying to college at the end of this session?'
        AND rc.choice_text = 'Stressed'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
        AND sq.question_text = 'How do you think %s feels about applying to college at the end of this session?'
        AND rc.choice_text = 'Nervous'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
        AND sq.question_text = 'How do you think %s feels about applying to college at the end of this session?'
        AND rc.choice_text = 'Neutral'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
        AND sq.question_text = 'How do you think %s feels about applying to college at the end of this session?'
        AND rc.choice_text = 'Optimistic'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
        AND sq.question_text = 'How do you think %s feels about applying to college at the end of this session?'
        AND rc.choice_text = 'Confident'
        AND sub.text::int = 50)
    OR (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
        AND sq.question_text = 'Were there any student safety, academic integrity, or community guideline issues during this session?'
        AND rc.choice_text = 'Yes'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
        AND sq.question_text = 'Were there any student safety, academic integrity, or community guideline issues during this session?'
        AND rc.choice_text = 'No'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
        AND sq.question_text = 'Sorry to hear that, what happened?'
        AND rc.choice_text = 'Tech issues'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
        AND sq.question_text = 'Sorry to hear that, what happened?'
        AND rc.choice_text = 'Ran out of time'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
        AND sq.question_text = 'Sorry to hear that, what happened?'
        AND rc.choice_text = 'I didn''t know topic'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
        AND sq.question_text = 'Sorry to hear that, what happened?'
        AND rc.choice_text = 'Wrong subject'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
        AND sq.question_text = 'Sorry to hear that, what happened?'
        AND rc.choice_text = 'Student participation'
        AND sub.text::int = 50)
    OR (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
        AND sq.question_text = 'Sorry to hear that, what happened?'
        AND rc.choice_text = 'Other'
        AND sub.text::int = 60)
    OR (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
        AND sq.question_text = 'This can be about the web app, the student you helped, technical issues, etc.'
        AND rc.choice_text = 'Your thoughts'
        AND sub.text::int = 10);

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
WHERE (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
    AND upchieve.subjects.name = 'planning'
    AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
        AND upchieve.subjects.name = 'applications'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
        AND upchieve.subjects.name = 'essays'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND upchieve.subjects.name = 'usHistory'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND upchieve.subjects.name = 'usHistory'
        AND upchieve.survey_types.name = 'postsession');

INSERT INTO upchieve.survey_response_choices (score, choice_text, created_at, updated_at)
    VALUES (0, 'Student shared their email, last name, or other personally identifiable information', NOW(), NOW()), (0, 'Student is in severe emotional distress and/or unsafe', NOW(), NOW()), (0, 'Student was pressuring me to do their work for them', NOW(), NOW()), (0, 'Student was working on a quiz or exam', NOW(), NOW()), (0, 'Student was mean or inappropriate', NOW(), NOW()), (0, 'Student made me feel uncomfortable', NOW(), NOW()), (0, 'Other (please provide details below)', NOW(), NOW()), (0, 'Your thoughts', NOW(), NOW());

UPDATE
    upchieve.surveys_survey_questions
SET
    display_priority = 70
FROM
    upchieve.survey_questions
WHERE
    survey_questions.question_text = 'This can be about the web app, the student you helped, technical issues, etc.'
    AND survey_questions.id = surveys_survey_questions.survey_question_id;

UPDATE
    upchieve.surveys_survey_questions
SET
    display_priority = 40
FROM
    upchieve.survey_questions
WHERE
    survey_questions.question_text = 'Were there any student safety, academic integrity, or community guideline issues during this session?'
    AND survey_questions.id = surveys_survey_questions.survey_question_id;

UPDATE
    upchieve.surveys_survey_questions
SET
    display_priority = 30
FROM
    upchieve.survey_questions
WHERE (survey_questions.question_text = 'How do you think %s feels about the %s at the end of this session?'
    OR survey_questions.question_text = 'How do you think %s feels about %s at the end of this session?')
AND survey_questions.id = surveys_survey_questions.survey_question_id;

UPDATE
    upchieve.surveys_survey_questions
SET
    display_priority = 20
FROM
    upchieve.survey_questions,
    upchieve.surveys
WHERE (survey_questions.question_text = 'Sorry to hear that, what happened?')
    AND survey_questions.id = surveys_survey_questions.survey_question_id
    AND surveys.id = surveys_survey_questions.survey_id
    AND surveys.name IN ('General Volunteer Post-Session Survey', 'SAT Prep Volunteer Post-Session Survey', 'College Counseling Volunteer Post-Session Survey');

INSERT INTO upchieve.surveys_survey_questions (survey_id, survey_question_id, display_priority, created_at, updated_at)
SELECT
    upchieve.surveys.id,
    upchieve.survey_questions.id,
    50,
    NOW(),
    NOW()
FROM
    upchieve.surveys
    JOIN upchieve.survey_questions ON TRUE
WHERE (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
    AND upchieve.survey_questions.question_text = 'Please select all that apply')
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND upchieve.survey_questions.question_text = 'Please select all that apply')
    OR (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
        AND upchieve.survey_questions.question_text = 'Please select all that apply');

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
    AND sq.question_text = 'Please select all that apply'
    AND rc.choice_text = 'Student shared their email, last name, or other personally identifiable information'
    AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND sq.question_text = 'Please select all that apply'
        AND rc.choice_text = 'Student is in severe emotional distress and/or unsafe'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND sq.question_text = 'Please select all that apply'
        AND rc.choice_text = 'Student was pressuring me to do their work for them'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND sq.question_text = 'Please select all that apply'
        AND rc.choice_text = 'Student was working on a quiz or exam'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND sq.question_text = 'Please select all that apply'
        AND rc.choice_text = 'Student was mean or inappropriate'
        AND sub.text::int = 50)
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND sq.question_text = 'Please select all that apply'
        AND rc.choice_text = 'Student made me feel uncomfortable'
        AND sub.text::int = 60)
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND sq.question_text = 'Please select all that apply'
        AND rc.choice_text = 'Other (please provide details below)'
        AND sub.text::int = 70)
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND sq.question_text = 'This can be about the web app, the student you helped, technical issues, etc.'
        AND rc.choice_text = 'Your thoughts'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND sq.question_text = 'How do you think %s feels about the %s at the end of this session?'
        AND rc.choice_text = 'Stressed'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND sq.question_text = 'How do you think %s feels about the %s at the end of this session?'
        AND rc.choice_text = 'Nervous'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND sq.question_text = 'How do you think %s feels about the %s at the end of this session?'
        AND rc.choice_text = 'Neutral'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND sq.question_text = 'How do you think %s feels about the %s at the end of this session?'
        AND rc.choice_text = 'Optimistic'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND sq.question_text = 'How do you think %s feels about the %s at the end of this session?'
        AND rc.choice_text = 'Confident'
        AND sub.text::int = 50)
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND sq.question_text = 'Please select all that apply'
        AND rc.choice_text = 'Student shared their email, last name, or other personally identifiable information'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND sq.question_text = 'Please select all that apply'
        AND rc.choice_text = 'Student is in severe emotional distress and/or unsafe'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND sq.question_text = 'Please select all that apply'
        AND rc.choice_text = 'Student was pressuring me to do their work for them'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND sq.question_text = 'Please select all that apply'
        AND rc.choice_text = 'Student was working on a quiz or exam'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND sq.question_text = 'Please select all that apply'
        AND rc.choice_text = 'Student was mean or inappropriate'
        AND sub.text::int = 50)
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND sq.question_text = 'Please select all that apply'
        AND rc.choice_text = 'Student made me feel uncomfortable'
        AND sub.text::int = 60)
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND sq.question_text = 'Please select all that apply'
        AND rc.choice_text = 'Other (please provide details below)'
        AND sub.text::int = 70)
    OR (upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        AND sq.question_text = 'This can be about the web app, the student you helped, technical issues, etc.'
        AND rc.choice_text = 'Your thoughts'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
        AND sq.question_text = 'Please select all that apply'
        AND rc.choice_text = 'Student shared their email, last name, or other personally identifiable information'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
        AND sq.question_text = 'Please select all that apply'
        AND rc.choice_text = 'Student is in severe emotional distress and/or unsafe'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
        AND sq.question_text = 'Please select all that apply'
        AND rc.choice_text = 'Student was pressuring me to do their work for them'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
        AND sq.question_text = 'Please select all that apply'
        AND rc.choice_text = 'Student was working on a quiz or exam'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
        AND sq.question_text = 'Please select all that apply'
        AND rc.choice_text = 'Student was mean or inappropriate'
        AND sub.text::int = 50)
    OR (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
        AND sq.question_text = 'Please select all that apply'
        AND rc.choice_text = 'Student made me feel uncomfortable'
        AND sub.text::int = 60)
    OR (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
        AND sq.question_text = 'Please select all that apply'
        AND rc.choice_text = 'Other (please provide details below)'
        AND sub.text::int = 70)
    OR (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
        AND sq.question_text = 'This can be about the web app, the student you helped, technical issues, etc.'
        AND rc.choice_text = 'Your thoughts'
        AND sub.text::int = 10)
    -- student survey response that was missed in original seeding
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND sq.question_text = 'This can be about the web app, the Academic Coach who helped you, the services UPchieve offers, etc.'
        AND rc.choice_text = 'Your thoughts'
        AND sub.text::int = 10);

-- migrate:down
UPDATE
    upchieve.surveys
SET
    name = 'College Counseling Post-Session Survey',
    updated_at = NOW()
WHERE
    name = 'College Counseling Volunteer Post-Session Survey';

DELETE FROM upchieve.survey_response_choices
WHERE choice_text = 'Student shared their email, last name, or other personally identifiable information'
    OR choice_text = 'Student is in severe emotional distress and/or unsafe'
    OR choice_text = 'Student was pressuring me to do their work for them'
    OR choice_text = 'Student was working on a quiz or exam'
    OR choice_text = 'Student was mean or inappropriate'
    OR choice_text = 'Student made me feel uncomfortable'
    OR choice_text = 'Other (please provide details below)'
    OR choice_text = 'Your thoughts';

-- DELETE FROM upchieve.surveys_survey_questions USING upchieve.survey_questions
-- WHERE surveys_survey_questions.survey_question_id = survey_questions.id
-- AND upchieve.survey_questions.question_text = 'Sorry to hear that, what happened?';
UPDATE
    upchieve.surveys_survey_questions
SET
    display_priority = 50
FROM
    upchieve.survey_questions
WHERE
    survey_questions.question_text = 'This can be about the web app, the student you helped, technical issues, etc.'
    AND survey_questions.id = surveys_survey_questions.survey_question_id;

UPDATE
    upchieve.surveys_survey_questions
SET
    display_priority = 40
FROM
    upchieve.survey_questions
WHERE
    survey_questions.question_text = 'Please select all that apply'
    AND survey_questions.id = surveys_survey_questions.survey_question_id;

UPDATE
    upchieve.surveys_survey_questions
SET
    display_priority = 30
FROM
    upchieve.survey_questions
WHERE
    survey_questions.question_text = 'Were there any student safety, academic integrity, or community guideline issues during this session?'
    AND survey_questions.id = surveys_survey_questions.survey_question_id;

UPDATE
    upchieve.surveys_survey_questions
SET
    display_priority = 20
FROM
    upchieve.survey_questions
WHERE (survey_questions.question_text = 'How do you think %s feels about applying to college at the end of this session?'
    OR survey_questions.question_text = 'How do you think %s feels about the %s at the end of this session?'
    OR survey_questions.question_text = 'How do you think %s feels about %s at the end of this session?')
AND survey_questions.id = surveys_survey_questions.survey_question_id;

DELETE FROM upchieve.survey_questions_response_choices USING upchieve.surveys_survey_questions, upchieve.surveys, upchieve.survey_questions
WHERE upchieve.surveys_survey_questions.id = upchieve.surveys_survey_questions.id
    AND upchieve.surveys_survey_questions.survey_id = upchieve.surveys.id
    AND upchieve.survey_questions.id = upchieve.surveys_survey_questions.survey_question_id
    AND (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        OR upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
        OR upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey')
    AND (upchieve.survey_questions.question_text = 'Sorry to hear that, what happened?'
        OR upchieve.survey_questions.question_text = 'How do you think %s feels about %s at the end of this session?'
        OR upchieve.survey_questions.question_text = 'Were there any student safety, academic integrity, or community guideline issues during this session?'
        OR upchieve.survey_questions.question_text = 'Please select all that apply'
        OR upchieve.survey_questions.question_text = 'This can be about the web app, the student you helped, technical issues, etc.'
        OR upchieve.survey_questions.question_text = '%s''s goal for this session was to %s. Were you able to help them achieve their goal?');


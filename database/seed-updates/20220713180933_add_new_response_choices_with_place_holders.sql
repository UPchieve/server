-- migrate:up
-- Add new confidence question for SAT and have the survey questions point to that new question
INSERT INTO upchieve.survey_questions (question_type_id, question_text, response_display_text, created_at, updated_at)
SELECT
    upchieve.question_types.id,
    'Overall, how do you feel about the %s section?',
    'Their confidence:',
    NOW(),
    NOW()
FROM
    upchieve.question_types
WHERE
    upchieve.question_types.name = 'multiple choice';

UPDATE
    upchieve.surveys_survey_questions
SET
    survey_question_id = subquery.id,
    updated_at = NOW()
FROM (
    SELECT
        upchieve.surveys.id AS survey_id,
        upchieve.surveys_survey_questions.survey_question_id,
        new_question.id
    FROM
        upchieve.surveys_survey_questions
        JOIN upchieve.surveys ON upchieve.surveys_survey_questions.survey_id = upchieve.surveys.id
        JOIN upchieve.survey_questions ON upchieve.surveys_survey_questions.survey_question_id = upchieve.survey_questions.id
        JOIN (
            SELECT
                id
            FROM
                upchieve.survey_questions
            WHERE
                question_text = 'Overall, how do you feel about the %s section?') AS new_question ON TRUE
        WHERE
            upchieve.surveys.name = 'SAT Prep Pre-Session Survey'
            AND upchieve.survey_questions.question_text = 'How do you feel about your ability to learn this topic?') AS subquery
WHERE
    upchieve.surveys_survey_questions.survey_id = subquery.survey_id
    AND upchieve.surveys_survey_questions.survey_question_id = subquery.survey_question_id;

-- Update the second question copy for non CC
UPDATE
    upchieve.survey_questions
SET
    question_text = 'How well do you understand the topic you want to talk about today?',
    updated_at = NOW()
WHERE
    upchieve.survey_questions.question_text = 'Where are you in the process of learning this specific topic?';

-- Update the third question copy for CC
UPDATE
    upchieve.survey_questions
SET
    question_text = 'Overall, how do you feel about applying to college?',
    updated_at = NOW()
WHERE
    upchieve.survey_questions.question_text = 'How do you feel about your ability to get accepted to college?';

-- Update the third question copy for non CC and non SAT
UPDATE
    upchieve.survey_questions
SET
    question_text = 'Overall, how do you feel about %s?',
    updated_at = NOW()
WHERE
    upchieve.survey_questions.question_text = 'How do you feel about your ability to learn this topic?';

-- Update response choices for STEM/Reading/SAT question two
UPDATE
    upchieve.survey_response_choices
SET
    choice_text = 'Not at all',
    updated_at = NOW()
WHERE
    upchieve.survey_response_choices.choice_text = 'I don''t know how to do it yet';

UPDATE
    upchieve.survey_response_choices
SET
    choice_text = 'A little',
    updated_at = NOW()
WHERE
    upchieve.survey_response_choices.choice_text = 'I am beginning to understand this, but I need some help';

UPDATE
    upchieve.survey_response_choices
SET
    choice_text = 'A medium amount',
    updated_at = NOW()
WHERE
    upchieve.survey_response_choices.choice_text = 'I understand this and can do it by myself';

UPDATE
    upchieve.survey_response_choices
SET
    choice_text = 'Really well',
    updated_at = NOW()
WHERE
    upchieve.survey_response_choices.choice_text = 'I understand this so well that I can help my friends do it';

-- add a new response choice that will be grouped with the above
INSERT INTO upchieve.survey_response_choices (score, choice_text, created_at, updated_at)
SELECT
    5,
    'Almost perfectly',
    NOW(),
    NOW();

-- add the new response choice to questions_response_choices for all the related surveys
INSERT INTO upchieve.survey_questions_response_choices (surveys_survey_question_id, response_choice_id, display_priority, created_at, updated_at)
SELECT
    ssq.id,
    rc.id,
    50,
    NOW(),
    NOW()
FROM
    upchieve.surveys_survey_questions ssq
    JOIN upchieve.survey_response_choices rc ON TRUE
    JOIN upchieve.surveys ON upchieve.surveys.id = ssq.survey_id
    JOIN upchieve.survey_questions sq ON sq.id = ssq.survey_question_id
WHERE (upchieve.surveys.name = 'STEM Pre-Session Survey'
    OR upchieve.surveys.name = 'SAT Prep Pre-Session Survey'
    OR upchieve.surveys.name = 'Reading Pre-Session Survey'
    OR upchieve.surveys.name = 'Humanities Essays Pre-Session Survey')
AND sq.question_text = 'How well do you understand the topic you want to talk about today?'
AND rc.choice_text = 'Almost perfectly';

-- add missing essays presession survey
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
WHERE
    upchieve.surveys.name = 'College Essays Pre-Session Survey'
    AND upchieve.subjects.name = 'essays'
    AND upchieve.survey_types.name = 'presession';

-- fix response choices with spaces at the end
UPDATE
    upchieve.survey_response_choices
SET
    choice_text = 'I''m finishing this up',
    updated_at = NOW()
WHERE
    upchieve.survey_response_choices.choice_text = 'I''m finishing this up ';

UPDATE
    upchieve.survey_response_choices
SET
    choice_text = 'I''ve completed this',
    updated_at = NOW()
WHERE
    upchieve.survey_response_choices.choice_text = 'I''ve completed this ';

-- add missing response choices to the college related presession surveys
INSERT INTO upchieve.survey_questions_response_choices (surveys_survey_question_id, response_choice_id, display_priority, created_at, updated_at)
SELECT
    ssq.id,
    rc.id,
    20,
    NOW(),
    NOW()
FROM
    upchieve.surveys_survey_questions ssq
    JOIN upchieve.survey_response_choices rc ON TRUE
    JOIN upchieve.surveys ON upchieve.surveys.id = ssq.survey_id
    JOIN upchieve.survey_questions sq ON sq.id = ssq.survey_question_id
WHERE (upchieve.surveys.name = 'College Planning Pre-Session Survey'
    OR upchieve.surveys.name = 'College Essays Pre-Session Survey'
    OR upchieve.surveys.name = 'College Applications Pre-Session Survey')
AND sq.question_text = 'Where are you in the process of reaching your goal?'
AND rc.choice_text = 'I''ve done some work on this';

INSERT INTO upchieve.survey_questions_response_choices (surveys_survey_question_id, response_choice_id, display_priority, created_at, updated_at)
SELECT
    ssq.id,
    rc.id,
    40,
    NOW(),
    NOW()
FROM
    upchieve.surveys_survey_questions ssq
    JOIN upchieve.survey_response_choices rc ON TRUE
    JOIN upchieve.surveys ON upchieve.surveys.id = ssq.survey_id
    JOIN upchieve.survey_questions sq ON sq.id = ssq.survey_question_id
WHERE (upchieve.surveys.name = 'College Planning Pre-Session Survey'
    OR upchieve.surveys.name = 'College Essays Pre-Session Survey'
    OR upchieve.surveys.name = 'College Applications Pre-Session Survey')
AND sq.question_text = 'Where are you in the process of reaching your goal?'
AND rc.choice_text = 'I''ve completed this';

-- update response display text copy
UPDATE
    upchieve.survey_questions
SET
    response_display_text = 'Their goal for the session:',
    updated_at = NOW()
WHERE
    upchieve.survey_questions.question_text = 'What is your primary goal for today''s session?';

UPDATE
    upchieve.survey_questions
SET
    response_display_text = 'How much progress they''ve made towards their goal:',
    updated_at = NOW()
WHERE
    upchieve.survey_questions.question_text = 'Where are you in the process of reaching your goal?';

UPDATE
    upchieve.survey_questions
SET
    response_display_text = 'How they feel about applying to college:',
    updated_at = NOW()
WHERE
    upchieve.survey_questions.question_text = 'Overall, how do you feel about applying to college?';

UPDATE
    upchieve.survey_questions
SET
    response_display_text = 'How well they understand the topic:',
    updated_at = NOW()
WHERE
    upchieve.survey_questions.question_text = 'How well do you understand the topic you want to talk about today?';

UPDATE
    upchieve.survey_questions
SET
    response_display_text = 'How they feel about %s:',
    updated_at = NOW()
WHERE
    upchieve.survey_questions.question_text = 'Overall, how do you feel about %s?'
    OR upchieve.survey_questions.question_text = 'Overall, how do you feel about the %s section?';

-- migrate:down
DELETE FROM upchieve.survey_questions_response_choices USING upchieve.survey_response_choices
WHERE upchieve.survey_questions_response_choices.response_choice_id = upchieve.survey_response_choices.id
    AND upchieve.survey_response_choices.choice_text = 'Almost perfectly';

DELETE FROM upchieve.survey_response_choices
WHERE upchieve.survey_response_choices.choice_text = 'Almost perfectly';

UPDATE
    upchieve.survey_response_choices
SET
    choice_text = 'I don''t know how to do it yet',
    updated_at = NOW()
WHERE
    upchieve.survey_response_choices.choice_text = 'Not at all';

UPDATE
    upchieve.survey_response_choices
SET
    choice_text = 'I am beginning to understand this, but I need some help',
    updated_at = NOW()
WHERE
    upchieve.survey_response_choices.choice_text = 'A little';

UPDATE
    upchieve.survey_response_choices
SET
    choice_text = 'I understand this and can do it by myself',
    updated_at = NOW()
WHERE
    upchieve.survey_response_choices.choice_text = 'A medium amount';

UPDATE
    upchieve.survey_response_choices
SET
    choice_text = 'I understand this so well that I can help my friends do it',
    updated_at = NOW()
WHERE
    upchieve.survey_response_choices.choice_text = 'Really well';

UPDATE
    upchieve.survey_questions
SET
    question_text = 'Where are you in the process of learning this specific topic?',
    updated_at = NOW()
WHERE
    upchieve.survey_questions.question_text = 'How well do you understand the topic you want to talk about today?';

UPDATE
    upchieve.survey_questions
SET
    question_text = 'How do you feel about your ability to get accepted to college?',
    updated_at = NOW()
WHERE
    upchieve.survey_questions.question_text = 'Overall, how do you feel about applying to college?';

UPDATE
    upchieve.survey_questions
SET
    question_text = 'How do you feel about your ability to learn this topic?',
    updated_at = NOW()
WHERE
    upchieve.survey_questions.question_text = 'Overall, how do you feel about %s?';

UPDATE
    upchieve.surveys_survey_questions
SET
    survey_question_id = subquery.id,
    updated_at = NOW()
FROM (
    SELECT
        upchieve.surveys.id AS survey_id,
        upchieve.surveys_survey_questions.survey_question_id,
        new_question.id
    FROM
        upchieve.surveys_survey_questions
        JOIN upchieve.surveys ON upchieve.surveys_survey_questions.survey_id = upchieve.surveys.id
        JOIN upchieve.survey_questions ON upchieve.surveys_survey_questions.survey_question_id = upchieve.survey_questions.id
        JOIN (
            SELECT
                id
            FROM
                upchieve.survey_questions
            WHERE
                question_text = 'How do you feel about your ability to learn this topic?') AS new_question ON TRUE
        WHERE
            upchieve.surveys.name = 'SAT Prep Pre-Session Survey'
            AND upchieve.survey_questions.question_text = 'Overall, how do you feel about the %s section?') AS subquery
WHERE
    upchieve.surveys_survey_questions.survey_id = subquery.survey_id
    AND upchieve.surveys_survey_questions.survey_question_id = subquery.survey_question_id;

DELETE FROM upchieve.surveys_context USING upchieve.surveys
WHERE upchieve.surveys_context.survey_id = upchieve.surveys.id
    AND upchieve.surveys.name = 'College Essays Pre-Session Survey';

DELETE FROM upchieve.survey_questions_response_choices USING upchieve.survey_response_choices
WHERE upchieve.survey_questions_response_choices.response_choice_id = upchieve.survey_response_choices.id
    AND upchieve.survey_response_choices.choice_text = 'I''ve done some work on this';

DELETE FROM upchieve.survey_questions_response_choices USING upchieve.survey_response_choices
WHERE upchieve.survey_questions_response_choices.response_choice_id = upchieve.survey_response_choices.id
    AND upchieve.survey_response_choices.choice_text = 'I''ve completed this';

UPDATE
    upchieve.survey_response_choices
SET
    choice_text = 'I''m finishing this up ',
    updated_at = NOW()
WHERE
    upchieve.survey_response_choices.choice_text = 'I''m finishing this up';

UPDATE
    upchieve.survey_response_choices
SET
    choice_text = 'I''ve completed this ',
    updated_at = NOW()
WHERE
    upchieve.survey_response_choices.choice_text = 'I''ve completed this';

-- reverting response display labels
UPDATE
    upchieve.survey_questions
SET
    response_display_text = 'Their goal:',
    updated_at = NOW()
WHERE
    upchieve.survey_questions.question_text = 'What is your primary goal for today''s session?';

UPDATE
    upchieve.survey_questions
SET
    response_display_text = 'Their progress:',
    updated_at = NOW()
WHERE
    upchieve.survey_questions.question_text = 'How well do you understand the topic you want to talk about today?'
    OR upchieve.survey_questions.question_text = 'Where are you in the process of reaching your goal?';

UPDATE
    upchieve.survey_questions
SET
    response_display_text = 'Their confidence:',
    updated_at = NOW()
WHERE
    upchieve.survey_questions.question_text = 'Overall, how do you feel about %s?'
    OR upchieve.survey_questions.question_text = 'Overall, how do you feel about the %s section?'
    OR upchieve.survey_questions.question_text = 'Overall, how do you feel about applying to college?';

DELETE FROM upchieve.survey_questions
WHERE upchieve.survey_questions.question_text = 'Overall, how do you feel about the %s section?';


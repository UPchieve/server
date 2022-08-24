-- migrate:up
INSERT INTO upchieve.survey_response_choices (score, choice_text, created_at, updated_at)
SELECT
    0,
    'I''m curious and want to learn something new',
    NOW(),
    NOW();

UPDATE
    upchieve.survey_questions_response_choices
SET
    display_priority = 70,
    updated_at = NOW()
FROM (
    SELECT
        id
    FROM
        upchieve.survey_response_choices
    WHERE
        choice_text = 'Other') AS subquery
WHERE
    upchieve.survey_questions_response_choices.response_choice_id = subquery.id;

INSERT INTO upchieve.survey_questions_response_choices (surveys_survey_question_id, response_choice_id, display_priority, created_at, updated_at)
SELECT
    ssq.id,
    rc.id,
    60,
    NOW(),
    NOW()
FROM
    upchieve.surveys_survey_questions ssq
    JOIN upchieve.survey_response_choices rc ON TRUE
    JOIN upchieve.surveys ON upchieve.surveys.id = ssq.survey_id
    JOIN upchieve.survey_questions sq ON sq.id = ssq.survey_question_id
WHERE (upchieve.surveys.name = 'STEM Pre-Session Survey'
    AND sq.question_text = 'What is your primary goal for today''s session?'
    AND rc.choice_text = 'I''m curious and want to learn something new')
-- migrate:down
DELETE FROM upchieve.survey_questions_response_choices USING upchieve.survey_response_choices
WHERE upchieve.survey_questions_response_choices.response_choice_id = upchieve.survey_response_choices.id
    AND upchieve.survey_response_choices.choice_text = 'I''m curious and want to learn something new';

DELETE FROM upchieve.survey_response_choices
WHERE upchieve.survey_response_choices.choice_text = 'I''m curious and want to learn something new';

UPDATE
    upchieve.survey_questions_response_choices
SET
    display_priority = 60,
    updated_at = NOW()
FROM (
    SELECT
        id
    FROM
        upchieve.survey_response_choices
    WHERE
        choice_text = 'Other') AS subquery
WHERE
    upchieve.survey_questions_response_choices.response_choice_id = subquery.id;


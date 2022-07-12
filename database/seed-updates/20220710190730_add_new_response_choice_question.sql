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


INSERT INTO upchieve.survey_questions_response_choices (response_choice_id, display_priority, surveys_survey_question_id, created_at, updated_at)
SELECT
    subquery.response_choice_id,
    60,
    subquery.survey_id,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.survey_response_choices.id AS response_choice_id,
        upchieve.surveys.id AS survey_id
    FROM
        upchieve.survey_response_choices
        JOIN upchieve.surveys ON TRUE
    WHERE
        upchieve.survey_response_choices.choice_text = 'I''m curious and want to learn something new'
        AND upchieve.surveys.name = 'STEM Pre-Session Survey') AS subquery;


-- migrate:down
DELETE FROM
  upchieve.survey_questions_response_choices USING upchieve.survey_response_choices
WHERE
  upchieve.survey_questions_response_choices.response_choice_id = upchieve.survey_response_choices.id
  AND upchieve.survey_response_choices.choice_text = 'I''m curious and want to learn something new';

DELETE FROM
  upchieve.survey_response_choices
WHERE
  upchieve.survey_response_choices.choice_text = 'I''m curious and want to learn something new';

UPDATE
  upchieve.survey_questions_response_choices
SET
  display_priority = 60,
  updated_at = NOW()
FROM
  (
    SELECT
      id
    FROM
      upchieve.survey_response_choices
    WHERE
      choice_text = 'Other'
  ) AS subquery
WHERE
  upchieve.survey_questions_response_choices.response_choice_id = subquery.id;
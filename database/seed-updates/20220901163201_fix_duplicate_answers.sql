-- migrate:up
-- Insert the new response choice
INSERT INTO upchieve.survey_response_choices (score, choice_text, created_at, updated_at)
    VALUES (0, 'Yes', NOW(), NOW()), (1, 'No', NOW(), NOW());

-- Migrate existing submissions to the newly insert response choices
UPDATE
    upchieve.users_surveys_submissions
SET
    survey_response_choice_id = subquery.ids[1],
    updated_at = NOW()
FROM (
    SELECT
        array_agg(id ORDER BY created_at DESC) AS ids
    FROM
        upchieve.survey_response_choices
    WHERE
        choice_text = 'Yes') AS subquery
WHERE
    upchieve.users_surveys_submissions.survey_response_choice_id = ANY (subquery.ids);

UPDATE
    upchieve.users_surveys_submissions
SET
    survey_response_choice_id = subquery.ids[1],
    updated_at = NOW()
FROM (
    SELECT
        array_agg(id ORDER BY created_at DESC) AS ids
    FROM
        upchieve.survey_response_choices
    WHERE
        choice_text = 'No') AS subquery
WHERE
    upchieve.users_surveys_submissions.survey_response_choice_id = ANY (subquery.ids);
-- Delete older response choices of 'Yes' and 'No'
WITH yes_ids AS (
    SELECT
        (array_agg(id ORDER BY created_at DESC))[2:] AS ids
    FROM
        upchieve.survey_response_choices
    WHERE
        choice_text = 'Yes')
DELETE FROM upchieve.survey_response_choices
WHERE (
        SELECT
            id = ANY (ids)
        FROM
            yes_ids);

WITH no_ids AS (
    SELECT
        (array_agg(id ORDER BY created_at DESC))[2:] AS ids
    FROM
        upchieve.survey_response_choices
    WHERE
        choice_text = 'No')
DELETE FROM upchieve.survey_response_choices
WHERE (
        SELECT
            id = ANY (ids)
        FROM
            no_ids);


-- migrate:down


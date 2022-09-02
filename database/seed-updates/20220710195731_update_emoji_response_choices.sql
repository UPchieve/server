-- migrate:up
INSERT INTO upchieve.survey_response_choices (score, choice_text, display_image, created_at, updated_at)
SELECT
    3,
    'Neutral',
    'https://cdn.upchieve.org/site-images/emojis/neutral-emoji.svg',
    NOW(),
    NOW();

UPDATE
    upchieve.survey_response_choices
SET
    choice_text = 'Stressed',
    display_image = 'https://cdn.upchieve.org/site-images/emojis/stressed-emoji.svg',
    updated_at = NOW()
WHERE
    upchieve.survey_response_choices.choice_text = '😭';

UPDATE
    upchieve.survey_response_choices
SET
    choice_text = 'Nervous',
    display_image = 'https://cdn.upchieve.org/site-images/emojis/nervous-emoji.svg',
    updated_at = NOW()
WHERE
    upchieve.survey_response_choices.choice_text = '😟';

UPDATE
    upchieve.survey_response_choices
SET
    choice_text = 'Optimistic',
    display_image = 'https://cdn.upchieve.org/site-images/emojis/optimistic-emoji.svg',
    score = 4,
    updated_at = NOW()
WHERE
    upchieve.survey_response_choices.choice_text = '🙂';

UPDATE
    upchieve.survey_response_choices
SET
    choice_text = 'Confident',
    display_image = 'https://cdn.upchieve.org/site-images/emojis/confident-emoji.svg',
    score = 5,
    updated_at = NOW()
WHERE
    upchieve.survey_response_choices.choice_text = '😀';

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
WHERE (upchieve.surveys.name = 'STEM Pre-Session Survey'
    AND sq.question_text = 'How do you feel about your ability to learn this topic?'
    AND rc.choice_text = 'Neutral'
    AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'Humanities Essays Pre-Session Survey'
        AND sq.question_text = 'How do you feel about your ability to learn this topic?'
        AND rc.choice_text = 'Neutral'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'Reading Pre-Session Survey'
        AND sq.question_text = 'How do you feel about your ability to learn this topic?'
        AND rc.choice_text = 'Neutral'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'SAT Prep Pre-Session Survey'
        AND sq.question_text = 'How do you feel about your ability to learn this topic?'
        AND rc.choice_text = 'Neutral'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'College Planning Pre-Session Survey'
        AND sq.question_text = 'How do you feel about your ability to get accepted to college?'
        AND rc.choice_text = 'Neutral'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'College Essays Pre-Session Survey'
        AND sq.question_text = 'How do you feel about your ability to get accepted to college?'
        AND rc.choice_text = 'Neutral'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'College Applications Pre-Session Survey'
        AND sq.question_text = 'How do you feel about your ability to get accepted to college?'
        AND rc.choice_text = 'Neutral'
        AND sub.text::int = 30);

UPDATE
    upchieve.survey_questions_response_choices
SET
    display_priority = 40,
    updated_at = NOW()
FROM (
    SELECT
        id
    FROM
        upchieve.survey_response_choices
    WHERE
        choice_text = 'Optimistic') AS subquery
WHERE
    upchieve.survey_questions_response_choices.response_choice_id = subquery.id;

UPDATE
    upchieve.survey_questions_response_choices
SET
    display_priority = 50,
    updated_at = NOW()
FROM (
    SELECT
        id
    FROM
        upchieve.survey_response_choices
    WHERE
        choice_text = 'Confident') AS subquery
WHERE
    upchieve.survey_questions_response_choices.response_choice_id = subquery.id;

-- migrate:down
-- NOTE: run `truncate table upchieve.users_surveys_submissions` if this down migration fails
DELETE FROM upchieve.survey_questions_response_choices USING upchieve.survey_response_choices
WHERE upchieve.survey_questions_response_choices.response_choice_id = upchieve.survey_response_choices.id
    AND upchieve.survey_response_choices.choice_text = 'Neutral';

DELETE FROM upchieve.survey_response_choices
WHERE upchieve.survey_response_choices.choice_text = 'Neutral';

UPDATE
    upchieve.survey_response_choices
SET
    choice_text = '😭',
    updated_at = NOW()
WHERE
    upchieve.survey_response_choices.choice_text = 'Stressed';

UPDATE
    upchieve.survey_response_choices
SET
    choice_text = '😟',
    updated_at = NOW()
WHERE
    upchieve.survey_response_choices.choice_text = 'Nervous';

UPDATE
    upchieve.survey_response_choices
SET
    choice_text = '🙂',
    score = 3,
    updated_at = NOW()
WHERE
    upchieve.survey_response_choices.choice_text = 'Optimistic';

UPDATE
    upchieve.survey_response_choices
SET
    choice_text = '😀',
    score = 4,
    updated_at = NOW()
WHERE
    upchieve.survey_response_choices.choice_text = 'Confident';

UPDATE
    upchieve.survey_questions_response_choices
SET
    display_priority = 30,
    updated_at = NOW()
FROM (
    SELECT
        id
    FROM
        upchieve.survey_response_choices
    WHERE
        choice_text = '🙂') AS subquery
WHERE
    upchieve.survey_questions_response_choices.response_choice_id = subquery.id;

UPDATE
    upchieve.survey_questions_response_choices
SET
    display_priority = 40,
    updated_at = NOW()
FROM (
    SELECT
        id
    FROM
        upchieve.survey_response_choices
    WHERE
        choice_text = '😀') AS subquery
WHERE
    upchieve.survey_questions_response_choices.response_choice_id = subquery.id;


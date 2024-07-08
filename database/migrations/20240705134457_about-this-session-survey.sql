-- migrate:up
-- Create a volunteer-only survey
INSERT INTO upchieve.surveys (name, role_id)
    VALUES ('About This Session Survey', 2);

INSERT INTO upchieve.survey_types (name)
    VALUES ('about-this-session');

INSERT INTO upchieve.surveys_context (survey_id, survey_type_id)
SELECT
    upchieve.surveys.id,
    upchieve.survey_types.id
FROM
    upchieve.surveys
    JOIN upchieve.survey_types ON TRUE
WHERE
    upchieve.surveys.name = 'About This Session Survey'
    AND upchieve.survey_types.name = 'about-this-session';

-- Question 1: Is this information helpful? (Multiple choice)
-- Answers: Not helpful (thumbs down), Helpful (thumbs up)
INSERT INTO upchieve.survey_response_choices (score, choice_text, display_image)
    VALUES (0, 'Not helpful', 'https://cdn.upchieve.org/site-images/thumbs-down.svg'), (1, 'Helpful', 'https://cdn.upchieve.org/site-images/thumbs-up.svg');

INSERT INTO upchieve.survey_questions (question_type_id, question_text)
SELECT
    qt.id,
    'Is this information helpful?'
FROM
    upchieve.question_types qt
WHERE
    qt.name = 'multiple choice';

INSERT INTO upchieve.surveys_survey_questions (survey_id, survey_question_id, display_priority)
SELECT
    s.id,
    sq.id,
    10
FROM
    upchieve.surveys s
    JOIN upchieve.survey_questions sq ON TRUE
WHERE
    s.name = 'About This Session Survey'
    AND sq.question_text = 'Is this information helpful?';

INSERT INTO upchieve.survey_questions_response_choices (surveys_survey_question_id, response_choice_id, display_priority)
SELECT
    ssq.id,
    rc.id,
    10
FROM
    upchieve.surveys s
    JOIN upchieve.surveys_survey_questions ssq ON ssq.survey_id = s.id
    JOIN upchieve.survey_response_choices rc ON TRUE
    JOIN upchieve.survey_questions sq ON sq.id = ssq.survey_question_id
WHERE
    s.name = 'About This Session Survey'
    AND rc.choice_text = 'Not helpful'
    AND rc.score = 0
    AND sq.question_text = 'Is this information helpful?';

INSERT INTO upchieve.survey_questions_response_choices (surveys_survey_question_id, response_choice_id, display_priority)
SELECT
    ssq.id,
    rc.id,
    20
FROM
    upchieve.surveys s
    JOIN upchieve.surveys_survey_questions ssq ON ssq.survey_id = s.id
    JOIN upchieve.survey_response_choices rc ON TRUE
    JOIN upchieve.survey_questions sq ON sq.id = ssq.survey_question_id
WHERE
    s.name = 'About This Session Survey'
    AND rc.choice_text = 'Helpful'
    AND rc.score = 1
    AND sq.question_text = 'Is this information helpful?';

-- Question 2: What information would you like to see here? (Free response)
INSERT INTO upchieve.survey_questions (question_type_id, question_text)
SELECT
    qt.id,
    'What information would you like to see here?'
FROM
    upchieve.question_types qt
WHERE
    qt.name = 'free response';

INSERT INTO upchieve.surveys_survey_questions (survey_id, survey_question_id, display_priority)
SELECT
    s.id,
    sq.id,
    20
FROM
    upchieve.surveys s
    JOIN upchieve.survey_questions sq ON TRUE
WHERE
    s.name = 'About This Session Survey'
    AND sq.question_text = 'What information would you like to see here?';

-- migrate:down
WITH survey AS (
    SELECT
        *
    FROM
        upchieve.surveys
    WHERE
        name = 'About This Session Survey')
DELETE FROM upchieve.surveys_survey_questions
WHERE survey_id IN (
        SELECT
            id
        FROM
            survey
        LIMIT 1);

DELETE FROM upchieve.surveys_context
WHERE survey_id = (
        SELECT
            id
        FROM
            upchieve.surveys
        WHERE
            name = 'About This Session Survey'
        LIMIT 1);

DELETE FROM upchieve.survey_response_choices
WHERE score = 0
    AND choice_text = 'Not helpful'
    AND display_image = 'https://cdn.upchieve.org/site-images/thumbs-down.svg';

DELETE FROM upchieve.survey_response_choices
WHERE score = 1
    AND choice_text = 'Helpful'
    AND display_image = 'https://cdn.upchieve.org/site-images/thumbs-up.svg';

DELETE FROM upchieve.survey_questions
WHERE question_text IN ('Is this information helpful?', 'What information would you like to see here?');

DELETE FROM upchieve.surveys
WHERE name = 'About This Session Survey';

DELETE FROM upchieve.survey_types
WHERE name = 'about-this-session';

-- @TODO
-- DELETE FROM upchieve.surveys_survey_questions
-- @TODO
-- DELETE FROM upchieve.survey_questions_response_choices

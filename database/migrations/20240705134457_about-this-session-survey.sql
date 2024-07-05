-- migrate:up
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

-- Question: Is this information helpful?
-- Answers: (0, Not helpful) or (1, Helpful)
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

INSERT INTO upchieve.survey_questions (question_type_id, question_text)
SELECT
    qt.id,
    'What information would you like to see here?'
FROM
    upchieve.question_types qt
WHERE
    qt.name = 'free response';

-- migrate:down
DELETE FROM upchieve.surveys
WHERE name = 'About This Session Survey';

DELETE FROM upchieve.survey_types
WHERE name = 'about-this-session';

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


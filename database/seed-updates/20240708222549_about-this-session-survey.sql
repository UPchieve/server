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

-- Question 1: "Is this information helpful?"
-- Multiple choices with answers "Helpful," "Not helpful"
INSERT INTO upchieve.survey_questions (question_type_id, question_text)
SELECT
    qt.id,
    'Is this information helpful?'
FROM
    upchieve.question_types qt
WHERE
    qt.name = 'multiple choice';

INSERT INTO upchieve.survey_response_choices (score, choice_text, display_image)
    VALUES (1, 'Helpful', 'https://cdn.upchieve.org/site-images/thumbs-up.svg'), (2, 'Not helpful', 'https://cdn.upchieve.org/site-images/thumbs-down.svg');

-- Question 2: "What would make this more helpful?"
-- Free response
INSERT INTO upchieve.survey_questions (question_type_id, question_text)
SELECT
    qt.id,
    'What would make this more helpful?'
FROM
    upchieve.question_types qt
WHERE
    qt.name = 'free response';

-- Associate questions to the survey
INSERT INTO upchieve.surveys_survey_questions (survey_id, survey_question_id, display_priority)
SELECT
    upchieve.surveys.id,
    upchieve.survey_questions.id,
    10
FROM
    upchieve.surveys
    JOIN upchieve.survey_questions ON TRUE
WHERE
    upchieve.surveys.name = 'About This Session Survey'
    AND upchieve.survey_questions.question_text = 'Is this information helpful?';

INSERT INTO upchieve.surveys_survey_questions (survey_id, survey_question_id, display_priority)
SELECT
    upchieve.surveys.id,
    upchieve.survey_questions.id,
    20
FROM
    upchieve.surveys
    JOIN upchieve.survey_questions ON TRUE
WHERE
    upchieve.surveys.name = 'About This Session Survey'
    AND upchieve.survey_questions.question_text = 'What would make this more helpful?';

-- Associate choices to the survey questions
INSERT INTO upchieve.survey_questions_response_choices (surveys_survey_question_id, response_choice_id, display_priority)
SELECT
    ssq.id,
    src.id,
    dp.text::int
FROM
    upchieve.surveys_survey_questions ssq
    JOIN upchieve.survey_response_choices src ON TRUE
    JOIN upchieve.surveys ON upchieve.surveys.id = ssq.survey_id
    JOIN upchieve.survey_questions sq ON sq.id = ssq.survey_question_id
    JOIN UNNEST(ARRAY[10, 20]) AS dp ON TRUE
WHERE
    surveys.name = 'About This Session Survey'
    AND (sq.question_text = 'Is this information helpful?'
        AND src.choice_text = 'Not helpful'
        AND dp.text::int = 10)
    OR (sq.question_text = 'Is this information helpful?'
        AND src.choice_text = 'Helpful'
        AND dp.text::int = 20);

INSERT INTO upchieve.survey_questions_response_choices (surveys_survey_question_id, response_choice_id, display_priority)
SELECT
    ssq.id,
    src.id,
    10
FROM
    upchieve.surveys_survey_questions ssq
    JOIN upchieve.survey_response_choices src ON TRUE
    JOIN upchieve.surveys ON upchieve.surveys.id = ssq.survey_id
    JOIN upchieve.survey_questions sq ON sq.id = ssq.survey_question_id
WHERE
    surveys.name = 'About This Session Survey'
    AND (sq.question_text = 'What would make this more helpful?'
        AND src.choice_text = 'Other');

-- migrate:down
DELETE FROM upchieve.survey_questions_response_choices sqrc
WHERE sqrc.surveys_survey_question_id IN (
        SELECT
            ssq.id
        FROM
            upchieve.surveys_survey_questions ssq
            JOIN upchieve.surveys s ON s.id = ssq.survey_id
        WHERE
            s.name = 'About This Session Survey');

DELETE FROM upchieve.surveys_survey_questions ssq
WHERE ssq.survey_id IN (
        SELECT
            s.id
        FROM
            upchieve.surveys s
        WHERE
            s.name = 'About This Session Survey');

DELETE FROM upchieve.survey_questions
WHERE question_text IN ('Is this information helpful?', 'What would make this more helpful?');

DELETE FROM upchieve.survey_response_choices
WHERE choice_text IN ('Helpful', 'Not helpful');

DELETE FROM upchieve.surveys_context
WHERE survey_id IN (
        SELECT
            s.id
        FROM
            upchieve.surveys s
        WHERE
            s.name = 'About This Session Survey');

DELETE FROM upchieve.survey_types
WHERE name = 'about-this-session';

DELETE FROM upchieve.surveys
WHERE name = 'About This Session Survey';


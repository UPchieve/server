-- migrate:up
CREATE TYPE upchieve.survey_question_display AS ENUM (
    'scale'
);

ALTER TABLE upchieve.survey_questions
    ADD COLUMN display upchieve.survey_question_display;

COMMENT ON COLUMN upchieve.survey_questions.display IS 'not_pii: How a client draws the question when its question type isn''t enough, like scale for 1 to 5 buttons';

-- migrate:down
ALTER TABLE upchieve.survey_questions
    DROP COLUMN display;

DROP TYPE upchieve.survey_question_display;


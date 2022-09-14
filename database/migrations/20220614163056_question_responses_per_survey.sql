-- migrate:up
TRUNCATE TABLE upchieve.survey_questions_response_choices;

ALTER TABLE upchieve.survey_questions_response_choices
    DROP COLUMN IF EXISTS survey_question_id,
    ADD COLUMN IF NOT EXISTS surveys_survey_question_id integer NOT NULL REFERENCES upchieve.surveys_survey_questions (id);

-- migrate:down
TRUNCATE TABLE upchieve.survey_questions_response_choices;

ALTER TABLE upchieve.survey_questions_response_choices
    DROP COLUMN IF EXISTS surveys_survey_question_id,
    ADD COLUMN IF NOT EXISTS survey_question_id integer NOT NULL REFERENCES upchieve.survey_questions (id);

-- NOTE: if you run this migration, make sure that you re-run seed migrations (through add-presession-survey-seeds)
--  because this migration truncates the table and makes the seed data go away.

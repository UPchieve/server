-- migrate:up
-- The TRUNCATE of survey_questions_response_choices was removed so this migration is
-- DDL-only and safe to run on logical-replication subscribers.
-- It only ever mattered on the original production run, where the table had rows
-- with the old column; on a from-empty build the table is empty at this point, so
-- adding the NOT NULL column succeeds.
ALTER TABLE upchieve.survey_questions_response_choices
    DROP COLUMN IF EXISTS survey_question_id,
    ADD COLUMN IF NOT EXISTS surveys_survey_question_id integer NOT NULL REFERENCES upchieve.surveys_survey_questions (id);

-- migrate:down
ALTER TABLE upchieve.survey_questions_response_choices
    DROP COLUMN IF EXISTS surveys_survey_question_id,
    ADD COLUMN IF NOT EXISTS survey_question_id integer NOT NULL REFERENCES upchieve.survey_questions (id);


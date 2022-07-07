-- migrate:up
ALTER TABLE upchieve.survey_questions_response_choices
  DROP COLUMN IF EXISTS survey_question_id,
  ADD COLUMN IF NOT EXISTS surveys_survey_question_id integer NOT NULL DEFAULT 1 REFERENCES upchieve.surveys_survey_questions (id);

-- migrate:down
ALTER TABLE upchieve.survey_questions_response_choices
  DROP COLUMN IF EXISTS surveys_survey_question_id,
  ADD COLUMN IF NOT EXISTS survey_question_id integer NOT NULL DEFAULT 1 REFERENCES upchieve.survey_questions (id);

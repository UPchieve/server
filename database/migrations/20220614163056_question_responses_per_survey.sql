-- migrate:up
ALTER TABLE upchieve.survey_questions_response_choices
  DROP COLUMN survey_question_id,
  ADD COLUMN surveys_survey_question_id integer NOT NULL REFERENCES upchieve.surveys_survey_questions (id);

-- migrate:down
ALTER TABLE upchieve.survey_questions_response_choices
  DROP COLUMN surveys_survey_question_id,
  ADD COLUMN survey_question_id integer NOT NULL REFERENCES upchieve.survey_questions (id);

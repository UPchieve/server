-- migrate:up
CREATE UNIQUE INDEX IF NOT EXISTS survey_questions_response_choices_response_survey_question ON upchieve.survey_questions_response_choices (response_choice_id, surveys_survey_question_id);

-- migrate:down
DROP INDEX IF EXISTS upchieve.survey_questions_response_choices_response_survey_question;


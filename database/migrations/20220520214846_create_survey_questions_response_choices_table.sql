-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.survey_questions_response_choices (
    survey_question_id integer NOT NULL REFERENCES upchieve.survey_questions (id),
    response_choice_id integer NOT NULL REFERENCES upchieve.survey_response_choices (id),
    display_priority smallint NOT NULL,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL)
-- migrate:down
DROP TABLE IF EXISTS upchieve.survey_questions_response_choices CASCADE

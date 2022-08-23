-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.users_surveys_submissions (
    user_survey_id uuid NOT NULL REFERENCES upchieve.users_surveys (id),
    survey_question_id integer NOT NULL REFERENCES upchieve.survey_questions (id),
    survey_response_choice_id integer REFERENCES upchieve.survey_response_choices (id),
    open_response text,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.users_surveys_submissions CASCADE

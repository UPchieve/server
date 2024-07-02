-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.surveys_survey_questions (
    id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    survey_id integer NOT NULL REFERENCES upchieve.surveys (id),
    survey_question_id integer NOT NULL REFERENCES upchieve.survey_questions (id),
    display_priority smallint NOT NULL,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.surveys_survey_questions CASCADE

-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.survey_responses (
    id serial PRIMARY KEY,
    survey_question_id int NOT NULL REFERENCES upchieve.survey_questions (id),
    response_type text NOT NULL,
    score int NOT NULL,
    response_text text NOT NULL,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.survey_responses CASCADE;


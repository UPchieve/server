-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.survey_questions (
    id serial PRIMARY KEY,
    survey_id int NOT NULL REFERENCES upchieve.surveys (id),
    question_type text NOT NULL,
    question_text text NOT NULL, 
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.survey_questions CASCADE;


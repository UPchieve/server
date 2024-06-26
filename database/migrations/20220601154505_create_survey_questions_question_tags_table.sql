-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.survey_questions_question_tags (
    id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    survey_question_id integer NOT NULL REFERENCES upchieve.survey_questions (id),
    question_tag_id integer NOT NULL REFERENCES upchieve.question_tags (id),
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.survey_questions_question_tags CASCADE

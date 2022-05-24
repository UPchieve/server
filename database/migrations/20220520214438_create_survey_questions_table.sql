-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.survey_questions (
    id serial PRIMARY KEY,
    question_tag_ids int[],
    question_type_id integer NOT NULL REFERENCES upchieve.question_types (id),
    question_text text NOT NULL,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.survey_questions CASCADE
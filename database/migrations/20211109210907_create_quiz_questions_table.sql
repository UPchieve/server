-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.quiz_questions (
    id serial PRIMARY KEY,
    question_text text NOT NULL,
    possible_answers jsonb,
    correct_answer text NOT NULL,
    quiz_subcategory_id int NOT NULL REFERENCES upchieve.quiz_subcategories (id),
    image_source text,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.quiz_questions CASCADE;


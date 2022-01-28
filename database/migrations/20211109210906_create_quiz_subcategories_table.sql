-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.quiz_subcategories (
    id serial PRIMARY KEY,
    name text NOT NULL,
    quiz_id int NOT NULL REFERENCES upchieve.quizzes (id),
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.quiz_subcategories CASCADE;


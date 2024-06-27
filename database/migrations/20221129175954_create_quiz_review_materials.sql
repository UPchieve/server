-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.quiz_review_materials (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    quiz_id integer NOT NULL REFERENCES upchieve.quizzes (id),
    title text NOT NULL,
    pdf text NOT NULL,
    image text NOT NULL,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.quiz_review_materials CASCADE;


-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.question_types (
    id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name text NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.question_types CASCADE;


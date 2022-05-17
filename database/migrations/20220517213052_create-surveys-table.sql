-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.surveys (
    id serial PRIMARY KEY,
    name text NOT NULL UNIQUE,
    subject_id int NOT NULL REFERENCES upchieve.subjects (id),
    survey_type text NOT NULL,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.surveys CASCADE;

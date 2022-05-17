-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.survey_response_submissions (
    id serial PRIMARY KEY,
    survey_response_id int NOT NULL REFERENCES upchieve.survey_responses (id),
    user_id uuid NOT NULL REFERENCES upchieve.users (id),
    session_id uuid NOT NULL UNIQUE REFERENCES upchieve.sessions (id),
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.survey_response_submissions CASCADE;


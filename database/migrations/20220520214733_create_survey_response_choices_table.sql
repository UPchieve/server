-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.survey_response_choices (
    id serial PRIMARY KEY,
    score smallint NOT NULL, 
    choice_text text NOT NULL,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.survey_response_choices CASCADE
-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.users_surveys (
    id uuid PRIMARY KEY,
    survey_id integer NOT NULL REFERENCES upchieve.surveys (id),
    user_id uuid NOT NULL REFERENCES upchieve.users (id),
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.users_surveys CASCADE

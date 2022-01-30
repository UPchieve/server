-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.pre_session_surveys (
    id uuid PRIMARY KEY,
    response_data json,
    session_id uuid NOT NULL UNIQUE REFERENCES upchieve.sessions (id),
    user_id uuid REFERENCES upchieve.users (id),
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.pre_session_surveys CASCADE;


-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.surveys (
    id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name text NOT NULL UNIQUE,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.surveys CASCADE;


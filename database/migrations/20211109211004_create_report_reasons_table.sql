-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.report_reasons (
    id serial PRIMARY KEY,
    reason text NOT NULL UNIQUE,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.report_reasons CASCADE;


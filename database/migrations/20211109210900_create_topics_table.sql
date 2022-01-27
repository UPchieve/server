-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.topics (
    id serial PRIMARY KEY,
    name text NOT NULL UNIQUE,
    icon_link text,
    color text,
    dashboard_order smallint NOT NULL UNIQUE,
    display_name text NOT NULL,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.topics CASCADE;


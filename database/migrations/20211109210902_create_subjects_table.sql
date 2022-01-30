-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.subjects (
    id serial PRIMARY KEY,
    name text NOT NULL UNIQUE,
    display_name text NOT NULL UNIQUE,
    display_order int NOT NULL,
    topic_id int NOT NULL REFERENCES upchieve.topics (id),
    tool_type_id int NOT NULL REFERENCES upchieve.tool_types (id),
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.subjects CASCADE;


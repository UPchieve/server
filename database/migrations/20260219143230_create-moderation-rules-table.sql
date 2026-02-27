-- migrate:up
CREATE TABLE upchieve.moderation_rules (
    id serial PRIMARY KEY,
    name text UNIQUE,
    description text
);

-- migrate:down
DROP TABLE upchieve.moderation_rules;


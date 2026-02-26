-- migrate:up
CREATE TABLE upchieve.moderation_actions (
    id serial PRIMARY KEY,
    action_name text UNIQUE,
    description text
);

-- migrate:down
DROP TABLE upchieve.moderation_actions;


-- migrate:up
CREATE TABLE upchieve.moderation_actions (
    id serial PRIMARY KEY,
    action_name varchar(30),
    description varchar
);

-- migrate:down
DROP TABLE upchieve.moderation_actions;


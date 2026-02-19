-- migrate:up
CREATE TABLE upchieve.moderation_rules (
    id serial PRIMARY KEY,
    name varchar(30),
    description varchar
);

-- migrate:down
DROP TABLE upchieve.moderation_rules;


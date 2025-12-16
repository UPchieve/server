-- migrate:up
CREATE TABLE upchieve.moderation_categories (
    id serial PRIMARY KEY,
    name text NOT NULL
);

-- migrate:down
DROP TABLE upchieve.moderation_categories;


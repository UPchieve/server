-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.sponsor_orgs (
    id uuid PRIMARY KEY,
    name text NOT NULL,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.sponsor_orgs;


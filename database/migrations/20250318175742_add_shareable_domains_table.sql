-- migrate:up
CREATE TABLE upchieve.shareable_domains (
    id serial PRIMARY KEY,
    domain VARCHAR(255) NOT NULL UNIQUE,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- migrate:down
DROP TABLE upchieve.shareable_domains;


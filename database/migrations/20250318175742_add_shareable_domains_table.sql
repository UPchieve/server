-- migrate:up
CREATE TABLE shareable_domains (
    id serial PRIMARY KEY,
    domain VARCHAR(255) NOT NULL UNIQUE,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- migrate:down
DROP TABLE shareable_domains;


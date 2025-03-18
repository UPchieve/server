-- migrate:up
<<<<<<< HEAD
CREATE TABLE upchieve.shareable_domains (
=======
CREATE TABLE shareable_domains (
>>>>>>> 86944335 (Adds shareable_domains table)
    id serial PRIMARY KEY,
    domain VARCHAR(255) NOT NULL UNIQUE,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- migrate:down
<<<<<<< HEAD
DROP TABLE upchieve.shareable_domains;
=======
DROP TABLE shareable_domains;
>>>>>>> 86944335 (Adds shareable_domains table)


-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.parents_guardians (
    id uuid NOT NULL,
    email text NOT NULL UNIQUE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id)
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.parents_guardians;


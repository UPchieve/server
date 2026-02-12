-- migrate:up
CREATE TABLE upchieve.nths_advisors (
    id uuid PRIMARY KEY,
    nths_group_id uuid NOT NULL REFERENCES upchieve.nths_groups (id),
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL UNIQUE,
    phone text NOT NULL,
    phone_extension text DEFAULT NULL,
    title text NOT NULL,
    verified boolean NOT NULL DEFAULT FALSE,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX nths_group_advisors_group_id ON upchieve.nths_advisors (nths_group_id);

-- migrate:down
DROP TABLE upchieve.nths_advisors;


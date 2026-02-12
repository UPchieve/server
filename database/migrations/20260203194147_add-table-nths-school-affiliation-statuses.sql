-- migrate:up
CREATE TABLE upchieve.nths_school_affiliation_statuses (
    id int PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name text NOT NULL UNIQUE,
    created_at timestamp with time zone NOT NULL DEFAULT NOW()
);

-- migrate:down
DROP TABLE upchieve.nths_school_affiliation_statuses;


-- migrate:up
CREATE TABLE upchieve.clever_school_mapping (
    clever_school_id text NOT NULL,
    upchieve_school_id uuid PRIMARY KEY REFERENCES upchieve.schools (id)
);

-- migrate:down
DROP TABLE upchieve.clever_school_mapping;


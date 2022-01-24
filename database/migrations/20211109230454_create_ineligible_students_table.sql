-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.ineligible_students (
    id uuid PRIMARY KEY,
    email text NOT NULL UNIQUE,
    postal_code varchar(2) REFERENCES upchieve.postal_codes (code),
    ip_address_id bigint REFERENCES upchieve.ip_addresses (id),
    school_id uuid REFERENCES upchieve.schools (id),
    grade_level_id int REFERENCES upchieve.grade_levels (id),
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.ineligible_students CASCADE;


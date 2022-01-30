-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.student_partner_orgs (
    id uuid PRIMARY KEY,
    key text NOT NULL UNIQUE,
    name text NOT NULL UNIQUE,
    signup_code text UNIQUE,
    high_school_signup boolean NOT NULL DEFAULT FALSE,
    college_signup boolean NOT NULL DEFAULT FALSE,
    school_signup_required boolean NOT NULL DEFAULT FALSE,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.student_partner_orgs CASCADE;


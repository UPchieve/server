-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.student_partner_org_sites (
    id uuid PRIMARY KEY,
    name text NOT NULL UNIQUE,
    student_partner_org_id uuid NOT NULL REFERENCES upchieve.student_partner_orgs (id),
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.student_partner_org_sites CASCADE;


-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.associated_partners (
    id uuid PRIMARY KEY,
    key text NOT NULL,
    volunteer_partner_org_id uuid NOT NULL REFERENCES upchieve.volunteer_partner_orgs (id),
    student_partner_org_id uuid REFERENCES upchieve.student_partner_orgs (id),
    student_sponsor_org_id uuid REFERENCES upchieve.sponsor_orgs (id),
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.associated_partners CASCADE;


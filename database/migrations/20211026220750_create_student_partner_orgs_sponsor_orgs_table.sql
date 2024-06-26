-- migrate:up
CREATE TABLE upchieve.student_partner_orgs_sponsor_orgs (
    student_partner_org_id uuid NOT NULL REFERENCES upchieve.student_partner_orgs (id),
    sponsor_org_id uuid NOT NULL REFERENCES upchieve.sponsor_orgs (id),
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL,
    PRIMARY KEY (student_partner_org_id, sponsor_org_id)
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.student_partner_orgs_sponsor_orgs CASCADE;


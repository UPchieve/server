-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.fall_incentive_excluded_partner_orgs (
    student_partner_org_id uuid PRIMARY KEY REFERENCES upchieve.student_partner_orgs (id),
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.fall_incentive_excluded_partner_orgs;


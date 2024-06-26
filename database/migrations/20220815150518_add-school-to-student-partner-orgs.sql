-- migrate:up
ALTER TABLE upchieve.student_partner_orgs
    ADD COLUMN school_id uuid;

ALTER TABLE upchieve.users_student_partner_orgs_instances
    DROP COLUMN student_partner_org_user_id,
    ADD COLUMN student_partner_org_user_id text;

CREATE TABLE IF NOT EXISTS upchieve.schools_sponsor_orgs_instances (
    school_id uuid REFERENCES upchieve.schools (id),
    sponsor_org_id uuid REFERENCES upchieve.sponsor_orgs (id),
    deactivated_on timestamptz,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS upchieve.sponsor_orgs_volunteer_partner_orgs_instances (
    sponsor_org_id uuid REFERENCES upchieve.sponsor_orgs (id),
    volunteer_partner_org_id uuid REFERENCES upchieve.volunteer_partner_orgs (id),
    deactivated_on timestamptz,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- migrate:down
ALTER TABLE upchieve.student_partner_orgs
    DROP COLUMN school_id;

ALTER TABLE upchieve.users_student_partner_orgs_instances
    DROP COLUMN student_partner_org_user_id,
    ADD COLUMN student_partner_org_user_id uuid;

DROP TABLE upchieve.schools_sponsor_orgs_instances;

DROP TABLE upchieve.sponsor_orgs_volunteer_partner_orgs_instances;


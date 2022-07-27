-- migrate:up
ALTER TABLE upchieve.student_partner_orgs
    ADD COLUMN school_id uuid REFERENCES upchieve.schools (id);

CREATE TABLE IF NOT EXISTS upchieve.student_partner_profile (
    user_id uuid PRIMARY KEY REFERENCES upchieve.users (id),
    student_partner_org_user_id uuid,
    student_partner_org_id uuid REFERENCES upchieve.student_partner_orgs (id),
    student_partner_org_site_id uuid REFERENCES upchieve.student_partner_org_sites (id),
    active boolean NOT NULL DEFAULT TRUE,
    deactivated_on timestamptz,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS upchieve.volunteer_partner_profile (
    user_id uuid PRIMARY KEY REFERENCES upchieve.users (id),
    volunteer_partner_org_user_id uuid,
    volunteer_partner_org_id uuid REFERENCES upchieve.volunteer_partner_orgs (id),
    active boolean NOT NULL DEFAULT TRUE,
    deactivated_on timestamptz,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.volunteer_partner_profile;
DROP TABLE IF EXISTS upchieve.student_partner_profile;
ALTER TABLE upchieve.student_partner_orgs
    DROP COLUMN school_id;

-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.student_partner_orgs_upchieve_instances (
    id uuid PRIMARY KEY,
    student_partner_org_id uuid REFERENCES upchieve.student_partner_orgs (id),
    deactivated_on timestamptz,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS upchieve.volunteer_partner_orgs_upchieve_instances (
    id uuid PRIMARY KEY,
    volunteer_partner_org_id uuid REFERENCES upchieve.volunteer_partner_orgs (id),
    deactivated_on timestamptz,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS upchieve.users_student_partner_orgs_instances (
    user_id uuid REFERENCES upchieve.users (id),
    student_partner_org_id uuid REFERENCES upchieve.student_partner_orgs (id),
    student_partner_org_site_id uuid REFERENCES upchieve.student_partner_org_sites (id),
    student_partner_org_user_id uuid,
    deactivated_on timestamptz,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS upchieve.users_volunteer_partner_orgs_instances (
    user_id uuid REFERENCES upchieve.users (id),
    volunteer_partner_org_id uuid REFERENCES upchieve.volunteer_partner_orgs (id),
    deactivated_on timestamptz,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS upchieve.sponsor_orgs_upchieve_instances (
    id uuid PRIMARY KEY,
    sponsor_org_id uuid REFERENCES upchieve.sponsor_orgs (id),
    deactivated_on timestamptz,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS upchieve.student_partner_orgs_sponsor_orgs_instances (
    student_partner_org_id uuid REFERENCES upchieve.student_partner_orgs (id),
    sponsor_org_id uuid REFERENCES upchieve.sponsor_orgs (id),
    deactivated_on timestamptz,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS upchieve.student_partner_orgs_volunteer_partner_orgs_instances (
    student_partner_org_id uuid REFERENCES upchieve.student_partner_orgs (id),
    volunteer_partner_org_id uuid REFERENCES upchieve.volunteer_partner_orgs (id),
    deactivated_on timestamptz,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.student_partner_orgs_upchieve_instances;

DROP TABLE IF EXISTS upchieve.volunteer_partner_orgs_upchieve_instances;

DROP TABLE IF EXISTS upchieve.users_student_partner_orgs_instances;

DROP TABLE IF EXISTS upchieve.users_volunteer_partner_orgs_instances;

DROP TABLE IF EXISTS upchieve.sponsor_orgs_upchieve_instances;

DROP TABLE IF EXISTS upchieve.student_partner_orgs_sponsor_orgs_instances;

DROP TABLE IF EXISTS upchieve.student_partner_orgs_volunteer_partner_orgs_instances;


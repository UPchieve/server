-- migrate:up
-- the `active` columns below are somewhat redundant since 'deactivated_on is null' tells you the same thing

CREATE TABLE IF NOT EXISTS upchieve.partner_orgs (
    id uuid PRIMARY KEY,
    name text NOT NULL UNIQUE,
    school_id uuid REFERENCES upchieve.schools (id),
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS upchieve.partner_org_sites (
    id uuid PRIMARY KEY,
    name text NOT NULL UNIQUE,
    partner_org_id uuid REFERENCES upchieve.partner_orgs (id),
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS upchieve.partner_org_instances (
    id uuid PRIMARY KEY,
    partner_org_id uuid REFERENCES upchieve.partner_orgs (id),
    active boolean NOT NULL DEFAULT true,
    deactivated_on timestamptz,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS upchieve.user_partner_profiles (
    user_id uuid REFERENCES upchieve.users (id),
    partner_org_id uuid REFERENCES upchieve.partner_orgs (id),
    partner_org_site_id uuid REFERENCES upchieve.partner_org_sites (id),  -- students only
    partner_org_user_id uuid,  -- students only
    active boolean NOT NULL DEFAULT true,
    deactivated_on timestamptz,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS upchieve.sponsor_org_instances (
    id uuid PRIMARY KEY,
    sponsor_org_id uuid REFERENCES upchieve.sponsor_orgs (id),
    active boolean NOT NULL DEFAULT true,
    deactivated_on timestamptz,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS upchieve.partner_org_sponsor_profiles (
    partner_org_id uuid REFERENCES upchieve.partner_orgs (id),
    sponsor_org_id uuid REFERENCES upchieve.sponsor_orgs (id),
    active boolean NOT NULL DEFAULT true,
    deactivated_on timestamptz,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS upchieve.partner_org_association_profiles (
    partner_org_id uuid REFERENCES upchieve.partner_orgs (id),
    associated_partner_org_id uuid REFERENCES upchieve.partner_orgs (id),
    active boolean NOT NULL DEFAULT true,
    deactivated_on timestamptz,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.partner_org_association_profiles;
DROP TABLE IF EXISTS upchieve.partner_org_sponsor_org_profiles;
DROP TABLE IF EXISTS upchieve.partner_org_instances;
DROP TABLE IF EXISTS upchieve.sponsor_org_instances;
DROP TABLE IF EXISTS upchieve.user_partner_profiles;
DROP TABLE IF EXISTS upchieve.partner_orgs;

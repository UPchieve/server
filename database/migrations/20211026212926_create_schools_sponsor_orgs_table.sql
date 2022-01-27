-- migrate:up
CREATE TABLE upchieve.schools_sponsor_orgs (
    school_id uuid NOT NULL REFERENCES upchieve.schools (id),
    sponsor_org_id uuid NOT NULL REFERENCES upchieve.sponsor_orgs (id),
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL,
    PRIMARY KEY (school_id, sponsor_org_id)
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.schools_sponsor_orgs CASCADE;


-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.required_email_domains (
    id uuid PRIMARY KEY,
    domain text NOT NULL UNIQUE,
    volunteer_partner_org_id uuid NOT NULL REFERENCES upchieve.volunteer_partner_orgs (id),
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.required_email_domains CASCADE;


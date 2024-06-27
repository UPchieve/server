-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.volunteer_profiles (
    user_id uuid PRIMARY KEY REFERENCES upchieve.users (id),
    volunteer_partner_org_id uuid REFERENCES upchieve.volunteer_partner_orgs (id),
    timezone text,
    approved boolean NOT NULL DEFAULT FALSE,
    onboarded boolean NOT NULL DEFAULT FALSE,
    photo_id_s3_key text,
    photo_id_status int REFERENCES upchieve.photo_id_statuses (id),
    linkedin_url text,
    college text,
    company text,
    languages text[],
    experience json,
    city text,
    state text,
    country text,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.volunteer_profiles CASCADE;


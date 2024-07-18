-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.volunteer_partner_orgs (
    id uuid PRIMARY KEY,
    key text NOT NULL UNIQUE,
    name text NOT NULL UNIQUE,
    receive_weekly_hour_summary_email boolean NOT NULL DEFAULT FALSE,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.volunteer_partner_orgs CASCADE;


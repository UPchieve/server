-- migrate:up
CREATE INDEX IF NOT EXISTS volunteer_partner_orgs_key ON upchieve.volunteer_partner_orgs (KEY);

-- migrate:down
DROP INDEX IF EXISTS upchieve.volunteer_partner_orgs_key;


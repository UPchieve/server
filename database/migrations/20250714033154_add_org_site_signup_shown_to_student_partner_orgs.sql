-- migrate:up
ALTER TABLE upchieve.student_partner_orgs
    ADD COLUMN "site_signup_shown" BOOLEAN;

-- migrate:down
ALTER TABLE upchieve.student_partner_orgs
    DROP COLUMN "site_signup_shown";


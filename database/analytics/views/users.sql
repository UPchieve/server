-- Override the default analytics.users with a derived email_domain column.
-- Reaches into upchieve.users to read the raw email at view-construction
-- time; only projects the non-PII derivation (the domain part) plus the
-- masked passthrough columns from _users.
CREATE OR REPLACE VIEW analytics.users AS
SELECT u.*,
       split_part(pu.email, '@', 2) AS email_domain
FROM analytics._users u
JOIN upchieve.users pu ON pu.id = u.id;

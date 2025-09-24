-- migrate:up
INSERT INTO upchieve.student_partner_orgs (id, KEY, name)
    VALUES (gen_random_uuid (), 'dummy-org', 'Dummy Org'), (gen_random_uuid (), 'dummy-school-org', 'Dummy School Org');

INSERT INTO upchieve.volunteer_partner_orgs (id, KEY, name)
    VALUES (gen_random_uuid (), 'dummy-org', 'Dummy Org');

-- migrate:down
DELETE FROM upchieve.student_partner_orgs
WHERE KEY = 'dummy-org'
    OR KEY = 'dummy-school-org';

DELETE FROM upchieve.volunteer_partner_orgs
WHERE KEY = 'dummy-org';


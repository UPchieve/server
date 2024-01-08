-- migrate:up
-- volunteer1@upchieve.org passed the usHistory quiz (quiz_id 32), but was missing the corresponding
-- certification for usHistory (certification_id 23), so we add it here.
-- Also, note that the certification was also added in the below test seed generation code, and may
-- need to be synched with this type of migration in the future to e.g. avoid double insertion:
-- database/seeds/testData/volunteers.ts
INSERT INTO upchieve.users_certifications
    VALUES ('01859800-bca8-af9e-8f1d-815bf6891cf5', 23, '2023-01-09 19:27:44.0+00'::timestamptz, '2023-01-09 19:27:44.0+00'::timestamptz);

-- migrate:down
DELETE FROM upchieve.users_certifications
WHERE user_id = '01859800-bca8-af9e-8f1d-815bf6891cf5'
    AND certification_id = 23;


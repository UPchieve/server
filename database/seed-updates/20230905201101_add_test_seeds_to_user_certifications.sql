-- migrate:up
-- for consistency with upchieve.users_quizzes test seed data
INSERT INTO upchieve.users_certifications
    VALUES ('01859800-bca8-af9e-8f1d-815bf6891cf5', 23, '2023-09-06 10:00:00.0 -04:00'::timestamptz, '2023-09-06 10:00:00.0 -04:00'::timestamptz);

-- migrate:down
DELETE FROM upchieve.users_certifications
WHERE user_id = '01859800-bca8-af9e-8f1d-815bf6891cf5'
    AND certification_id = 23;


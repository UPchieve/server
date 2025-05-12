-- migrate:up
INSERT INTO upchieve.user_roles (name)
    VALUES ('student_ambassador');

-- migrate:down
DELETE FROM upchieve.user_roles
WHERE name = 'student_ambassador';


-- migrate:up
INSERT INTO upchieve.user_roles (name, created_at, updated_at)
    VALUES ('teacher', NOW(), NOW());

-- migrate:down
DELETE FROM upchieve.user_roles
WHERE name = 'teacher';


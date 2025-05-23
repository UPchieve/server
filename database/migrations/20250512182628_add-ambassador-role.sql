-- migrate:up
INSERT INTO upchieve.user_roles (name)
    VALUES ('ambassador');

-- migrate:down
DELETE FROM upchieve.user_roles
WHERE name = 'ambassador';


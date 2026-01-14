-- migrate:up
INSERT INTO upchieve.nths_group_roles (name)
    VALUES ('admin');

INSERT INTO upchieve.nths_group_roles (name)
    VALUES ('member');

-- migrate:down
DELETE FROM upchieve.nths_group_roles
WHERE name IN ('admin', 'member');


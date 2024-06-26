-- migrate:up
INSERT INTO upchieve.grade_levels (name)
    VALUES ('6th'), ('7th');

-- migrate:down
DELETE FROM upchieve.grade_levels
WHERE name = '6th'
    OR name = '7th';


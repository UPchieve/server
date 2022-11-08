-- migrate:up
INSERT INTO upchieve.grade_levels (name, created_at, updated_at)
    VALUES ('Other', NOW(), NOW());

-- migrate:down
DELETE FROM upchieve.signup_sources
WHERE name = 'Other'

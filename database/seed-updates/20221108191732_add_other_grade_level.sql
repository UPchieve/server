-- migrate:up
INSERT INTO upchieve.grade_levels (name, created_at, updated_at)
    VALUES ('Other', NOW(), NOW())
ON CONFLICT ON CONSTRAINT grade_levels_name_key
    DO NOTHING;

-- migrate:down
DELETE FROM upchieve.grade_levels
WHERE name = 'Other'

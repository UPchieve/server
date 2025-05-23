-- migrate:up
INSERT INTO upchieve.question_types (name, created_at, updated_at)
    VALUES ('number', NOW(), NOW());

-- migrate:down
DELETE FROM upchieve.question_types
WHERE name = 'number';


-- migrate:up
UPDATE
    upchieve.session_flags
SET
    name = 'Pressuring coach',
    updated_at = NOW()
WHERE
    name = 'Only looking for answers';

UPDATE
    upchieve.session_flags
SET
    name = 'Mean or inappropriate',
    updated_at = NOW()
WHERE
    name = 'Rude or inappropriate';

INSERT INTO upchieve.session_flags (name, created_at, updated_at)
    VALUES ('PII', NOW(), NOW()), ('Graded assignment', NOW(), NOW()), ('Coach uncomfortable', NOW(), NOW()), ('Student in distress', NOW(), NOW());

-- migrate:down
UPDATE
    upchieve.session_flags
SET
    name = 'Only looking for answers',
    updated_at = NOW()
WHERE
    name = 'Pressuring coach';

UPDATE
    upchieve.session_flags
SET
    name = 'Rude or inappropriate',
    updated_at = NOW()
WHERE
    name = 'Mean or inappropriate';

DELETE FROM upchieve.session_flags
WHERE name = 'PII'
    OR name = 'Graded assignment'
    OR name = 'Coach uncomfortable'
    OR name = 'Student in distress';


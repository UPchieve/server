-- migrate:up
INSERT INTO upchieve.quiz_subcategories (name, quiz_id)
SELECT
    q.name,
    q.id
FROM
    upchieve.quizzes q
WHERE
    q.name IN ('coachingStrategies', 'academicIntegrity', 'dei', 'communitySafety');

-- migrate:down
DELETE FROM upchieve.quiz_subcategories
WHERE name IN ('coachingStrategies', 'academicIntegrity', 'dei', 'communitySafety');


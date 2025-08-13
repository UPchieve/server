-- migrate:up
INSERT INTO upchieve.certifications (name, active)
    VALUES ('effectiveCoachingStrategies', TRUE);

INSERT INTO upchieve.certifications (name, active)
    VALUES ('academicIntegrity', TRUE);

INSERT INTO upchieve.certifications (name, active)
    VALUES ('dei', TRUE);

INSERT INTO upchieve.certifications (name, active)
    VALUES ('communitySafety', TRUE);

INSERT INTO upchieve.quiz_certification_grants (quiz_id, certification_id)
SELECT
    q.id AS quiz_id,
    c.id AS certification_id
FROM
    upchieve.quizzes q
    JOIN upchieve.certifications c ON q.name = c.name
WHERE
    q.name IN ('effectiveCoachingStrategies', 'academicIntegrity', 'dei', 'communitySafety');

-- migrate:down
DELETE FROM upchieve.quiz_certification_grants
WHERE quiz_id IN (
        SELECT
            id
        FROM
            upchieve.quizzes
        WHERE
            name IN ('effectiveCoachingStrategies', 'academicIntegrity', 'dei', 'communitySafety'));

DELETE FROM upchieve.certifications
WHERE name IN ('effectiveCoachingStrategies', 'academicIntegrity', 'dei', 'communitySafety');


-- migrate:up
INSERT INTO upchieve.quizzes (name, active, questions_per_subcategory)
    VALUES ('effectiveCoachingStrategies', TRUE, 3);

INSERT INTO upchieve.quizzes (name, active, questions_per_subcategory)
    VALUES ('academicIntegrity', TRUE, 3);

INSERT INTO upchieve.quizzes (name, active, questions_per_subcategory)
    VALUES ('dei', TRUE, 3);

INSERT INTO upchieve.quizzes (name, active, questions_per_subcategory)
    VALUES ('communitySafety', TRUE, 3);

-- migrate:down
DELETE FROM upchieve.quizzes
WHERE name IN ('effectiveCoachingStrategies', 'academicIntegrity', 'dei', 'communitySafety');


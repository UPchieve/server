-- migrate:up
INSERT INTO upchieve.quizzes (name, active, questions_per_subcategory)
    VALUES ('coachingStrategies', TRUE, 3);

INSERT INTO upchieve.quizzes (name, active, questions_per_subcategory)
    VALUES ('academicIntegrity', TRUE, 3);

INSERT INTO upchieve.quizzes (name, active, questions_per_subcategory)
    VALUES ('dei', TRUE, 3);

INSERT INTO upchieve.quizzes (name, active, questions_per_subcategory)
    VALUES ('communitySafety', TRUE, 3);

-- migrate:down
DELETE FROM upchieve.quizzes
WHERE name IN ('coachingStrategies', 'academicIntegrity', 'dei', 'communitySafety');


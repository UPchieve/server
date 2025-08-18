-- migrate:up
INSERT INTO upchieve.training_courses (name, display_name)
    VALUES ('upchieveTraining', 'UPchieve Training');

-- migrate:down
DELETE FROM upchieve.training_courses
WHERE name = 'upchieveTraining';


-- migrate:up
ALTER TABLE upchieve.training_courses
    ADD COLUMN quiz_id INTEGER REFERENCES upchieve.quizzes (id);

ALTER TABLE upchieve.training_courses
    ADD COLUMN description TEXT;

UPDATE
    upchieve.training_courses
SET
    quiz_id = (
        SELECT
            id
        FROM
            upchieve.quizzes
        WHERE
            name = 'upchieve101'
        LIMIT 1),
description = 'UPchieve101 will teach you everything you need to know to start helping students achieve their academic goals! You''ll need to pass a short quiz at the end in order to be ready to coach.'
WHERE
    name = 'upchieve101';

-- migrate:down
ALTER TABLE upchieve.training_courses
    DROP COLUMN quiz_id;

ALTER TABLE upchieve.training_courses
    DROP COLUMN description;


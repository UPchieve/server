-- migrate:up
ALTER TABLE upchieve.training_courses
    ADD COLUMN quiz_id INTEGER REFERENCES upchieve.quizzes (id);

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
        LIMIT 1)
WHERE
    name = 'upchieve101';

-- migrate:down
ALTER TABLE upchieve.training_courses
    DROP COLUMN quiz_id;


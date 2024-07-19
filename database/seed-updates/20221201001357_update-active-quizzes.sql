-- migrate:up
UPDATE
    upchieve.quizzes
SET
    active = FALSE,
    updated_at = NOW()
WHERE
    name = 'humanitiesEssays'
    OR name = 'worldHistory';

-- migrate:down
UPDATE
    upchieve.quizzes
SET
    active = TRUE,
    updated_at = NOW()
WHERE
    name = 'humanitiesEssays'
    OR name = 'worldHistory';


-- migrate:up
UPDATE
    upchieve.quizzes
SET
    active = TRUE,
    updated_at = NOW();

UPDATE
    upchieve.certifications
SET
    active = TRUE,
    updated_at = NOW();

UPDATE
    upchieve.quizzes
SET
    active = FALSE,
    updated_at = NOW()
WHERE
    upchieve.quizzes.name = 'applications'
    OR upchieve.quizzes.name = 'planning'
    OR upchieve.quizzes.name = 'essays';

UPDATE
    upchieve.certifications
SET
    active = FALSE,
    updated_at = NOW()
WHERE
    upchieve.certifications.name = 'applications'
    OR upchieve.certifications.name = 'planning'
    OR upchieve.certifications.name = 'essays';

-- migrate:down
UPDATE
    upchieve.quizzes
SET
    active = TRUE,
    updated_at = NOW()
WHERE
    upchieve.quizzes.name = 'applications'
    OR upchieve.quizzes.name = 'planning'
    OR upchieve.quizzes.name = 'essays';

UPDATE
    upchieve.certifications
SET
    active = TRUE,
    updated_at = NOW()
WHERE
    upchieve.certifications.name = 'applications'
    OR upchieve.certifications.name = 'planning'
    OR upchieve.certifications.name = 'essays';


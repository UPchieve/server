-- migrate:up
UPDATE
    upchieve.training_courses
SET
    display_name = 'UPchieve 101',
    updated_at = NOW()
WHERE
    name = 'upchieve101';

-- migrate:down
UPDATE
    upchieve.training_courses
SET
    display_name = NULL,
    updated_at = NOW()
WHERE
    name = 'upchieve101';


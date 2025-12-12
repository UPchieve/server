-- migrate:up
UPDATE
    upchieve.training_courses
SET
    display_name = 'Intro to UPchieve',
    updated_at = NOW()
WHERE
    name = 'upchieve101'
    OR name = 'upchieveTraining';

-- migrate:down
UPDATE
    upchieve.training_courses
SET
    display_name = 'UPchieve 101',
    updated_at = NOW()
WHERE
    name = 'upchieve101'
    OR name = 'upchieveTraining';


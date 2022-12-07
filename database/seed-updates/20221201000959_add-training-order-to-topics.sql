-- migrate:up
UPDATE
    upchieve.topics
SET
    training_order = 1,
    updated_at = NOW()
WHERE
    name = 'math';

UPDATE
    upchieve.topics
SET
    training_order = 2,
    updated_at = NOW()
WHERE
    name = 'science';

UPDATE
    upchieve.topics
SET
    training_order = 5,
    updated_at = NOW()
WHERE
    name = 'college';

UPDATE
    upchieve.topics
SET
    training_order = 6,
    updated_at = NOW()
WHERE
    name = 'sat';

UPDATE
    upchieve.topics
SET
    training_order = 3,
    updated_at = NOW()
WHERE
    name = 'readingWriting';

UPDATE
    upchieve.topics
SET
    training_order = 4,
    updated_at = NOW()
WHERE
    name = 'socialStudies';

-- migrate:down
UPDATE
    upchieve.topics
SET
    training_order = 0,
    updated_at = NOW()
WHERE
    name = 'math'
    OR name = 'science'
    OR name = 'college'
    OR name = 'sat'
    OR name = 'readingWriting'
    OR name = 'socialStudies';


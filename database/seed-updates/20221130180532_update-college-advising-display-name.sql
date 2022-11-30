-- migrate:up
UPDATE
    upchieve.topics
SET
    display_name = 'College Counseling',
    updated_at = NOW()
WHERE
    upchieve.topics.name = 'college';

-- migrate:down
UPDATE
    upchieve.topics
SET
    display_name = 'College Advising',
    updated_at = NOW()
WHERE
    upchieve.topics.name = 'college';


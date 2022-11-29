-- migrate:up
UPDATE
    upchieve.topics
SET
    icon_link = 'https://cdn.upchieve.org/site-images/topic-icons/math.svg',
    updated_at = NOW()
WHERE
    name = 'math';

UPDATE
    upchieve.topics
SET
    icon_link = 'https://cdn.upchieve.org/site-images/topic-icons/science.svg',
    updated_at = NOW()
WHERE
    name = 'science';

UPDATE
    upchieve.topics
SET
    icon_link = 'https://cdn.upchieve.org/site-images/topic-icons/college.svg',
    updated_at = NOW()
WHERE
    name = 'college';

UPDATE
    upchieve.topics
SET
    icon_link = 'https://cdn.upchieve.org/site-images/topic-icons/sat.svg',
    updated_at = NOW()
WHERE
    name = 'sat';

UPDATE
    upchieve.topics
SET
    icon_link = 'https://cdn.upchieve.org/site-images/topic-icons/english.svg',
    updated_at = NOW()
WHERE
    name = 'readingWriting';

UPDATE
    upchieve.topics
SET
    icon_link = 'https://cdn.upchieve.org/site-images/topic-icons/social-studies.svg',
    updated_at = NOW()
WHERE
    name = 'socialStudies';

-- migrate:down
UPDATE
    upchieve.topics
SET
    icon_link = NULL,
    updated_at = NOW()
WHERE
    name = 'math'
    OR name = 'science'
    OR name = 'college'
    OR name = 'sat'
    OR name = 'readingWriting'
    OR name = 'socialStudies';


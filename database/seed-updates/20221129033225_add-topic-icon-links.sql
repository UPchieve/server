-- migrate:up
UPDATE
    upchieve.topics
SET
    icon_link = 'https://cdn.upchieve.org/site-images/topic-icons/math.svg',
    color = '#E398E4',
    updated_at = NOW()
WHERE
    name = 'math';

UPDATE
    upchieve.topics
SET
    icon_link = 'https://cdn.upchieve.org/site-images/topic-icons/science.svg',
    color = '#9675CE',
    updated_at = NOW()
WHERE
    name = 'science';

UPDATE
    upchieve.topics
SET
    icon_link = 'https://cdn.upchieve.org/site-images/topic-icons/college.svg',
    color = '#F1C026',
    updated_at = NOW()
WHERE
    name = 'college';

UPDATE
    upchieve.topics
SET
    icon_link = 'https://cdn.upchieve.org/site-images/topic-icons/sat.svg',
    color = '#54DEFD',
    updated_at = NOW()
WHERE
    name = 'sat';

UPDATE
    upchieve.topics
SET
    icon_link = 'https://cdn.upchieve.org/site-images/topic-icons/english.svg',
    color = '#1855D1',
    updated_at = NOW()
WHERE
    name = 'readingWriting';

UPDATE
    upchieve.topics
SET
    icon_link = 'https://cdn.upchieve.org/site-images/topic-icons/social-studies.svg',
    color = '#593C33',
    updated_at = NOW()
WHERE
    name = 'socialStudies';

-- migrate:down
UPDATE
    upchieve.topics
SET
    icon_link = NULL,
    color = NULL,
    updated_at = NOW()
WHERE
    name = 'math'
    OR name = 'science'
    OR name = 'college'
    OR name = 'sat'
    OR name = 'readingWriting'
    OR name = 'socialStudies';


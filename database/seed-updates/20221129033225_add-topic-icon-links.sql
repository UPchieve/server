-- migrate:up
UPDATE
    upchieve.topics
SET
    icon_link = 'https://cdn.upchieve.org/site-images/topic-icons/math.svg'
WHERE
    name = 'math';

UPDATE
    upchieve.topics
SET
    icon_link = 'https://cdn.upchieve.org/site-images/topic-icons/science.svg'
WHERE
    name = 'science';

UPDATE
    upchieve.topics
SET
    icon_link = 'https://cdn.upchieve.org/site-images/topic-icons/college.svg'
WHERE
    name = 'college';

UPDATE
    upchieve.topics
SET
    icon_link = 'https://cdn.upchieve.org/site-images/topic-icons/sat.svg'
WHERE
    name = 'sat';

UPDATE
    upchieve.topics
SET
    icon_link = 'https://cdn.upchieve.org/site-images/topic-icons/english.svg'
WHERE
    name = 'readingWriting';

UPDATE
    upchieve.topics
SET
    icon_link = 'https://cdn.upchieve.org/site-images/topic-icons/social-studies.svg'
WHERE
    name = 'socialStudies';

-- migrate:down
UPDATE
    upchieve.topics
SET
    icon_link = ''
WHERE
    name = 'math'
    OR name = 'science'
    OR name = 'college'
    OR name = 'sat'
    OR name = 'readingWriting'
    OR name = 'socialStudies';


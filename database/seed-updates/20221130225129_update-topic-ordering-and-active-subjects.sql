-- migrate:up
UPDATE
    upchieve.topics
SET
    dashboard_order = 1,
    updated_at = NOW()
WHERE
    name = 'math';

UPDATE
    upchieve.topics
SET
    dashboard_order = 3,
    updated_at = NOW()
WHERE
    name = 'science';

UPDATE
    upchieve.topics
SET
    dashboard_order = 5,
    updated_at = NOW()
WHERE
    name = 'college';

UPDATE
    upchieve.topics
SET
    dashboard_order = 6,
    updated_at = NOW()
WHERE
    name = 'sat';

UPDATE
    upchieve.topics
SET
    dashboard_order = 2,
    updated_at = NOW()
WHERE
    name = 'readingWriting';

UPDATE
    upchieve.topics
SET
    dashboard_order = 4,
    updated_at = NOW()
WHERE
    name = 'socialStudies';

-- Update subjects that should be hidden/shown on the student dashboard view
UPDATE
    upchieve.subjects
SET
    active = TRUE,
    updated_at = NOW()
WHERE
    name = 'humanitiesEssays';

UPDATE
    upchieve.subjects
SET
    active = FALSE,
    updated_at = NOW()
WHERE
    name = 'calculusBC'
    OR name = 'physicsTwo'
    OR name = 'collegePrep'
    OR name = 'collegeList'
    OR name = 'collegeApps'
    OR name = 'applicationEssays'
    OR name = 'financialAid'
    OR name = 'essayPlanning'
    OR name = 'essayFeedback';

-- migrate:down
UPDATE
    upchieve.topics
SET
    dashboard_order = 4,
    updated_at = NOW()
WHERE
    name = 'science';

UPDATE
    upchieve.topics
SET
    dashboard_order = 3,
    updated_at = NOW()
WHERE
    name = 'college';

UPDATE
    upchieve.topics
SET
    dashboard_order = 2,
    updated_at = NOW()
WHERE
    name = 'sat';

UPDATE
    upchieve.topics
SET
    dashboard_order = 5,
    updated_at = NOW()
WHERE
    name = 'readingWriting';

UPDATE
    upchieve.topics
SET
    dashboard_order = 6,
    updated_at = NOW()
WHERE
    name = 'socialStudies';

UPDATE
    upchieve.subjects
SET
    active = TRUE,
    updated_at = NOW()
WHERE
    name = 'calculusBC'
    OR name = 'physicsTwo'
    OR name = 'collegePrep'
    OR name = 'collegeList'
    OR name = 'collegeApps'
    OR name = 'applicationEssays'
    OR name = 'financialAid'
    OR name = 'essayPlanning'
    OR name = 'essayFeedback';

UPDATE
    upchieve.subjects
SET
    active = FALSE,
    updated_at = NOW()
WHERE
    name = 'humanitiesEssays';


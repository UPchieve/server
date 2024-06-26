-- migrate:up
UPDATE
    upchieve.quizzes
SET
    questions_per_subcategory = 1,
    updated_at = NOW()
WHERE
    name = 'algebraTwo'
    OR name = 'statistics'
    OR name = 'calculusAB'
    OR name = 'calculusBC'
    OR name = 'biology'
    OR name = 'chemistry'
    OR name = 'physicsOne'
    OR name = 'physicsTwo'
    OR name = 'environmentalScience'
    OR name = 'satMath'
    OR name = 'satReading'
    OR name = 'humanitiesEssays'
    OR name = 'reading'
    OR name = 'essayPlanning'
    OR name = 'essayFeedback'
    OR name = 'usHistory'
    OR name = 'worldHistory'
    OR name = 'anatomy';

UPDATE
    upchieve.quizzes
SET
    questions_per_subcategory = 2,
    updated_at = NOW()
WHERE
    name = 'prealgebra'
    OR name = 'algebraOne'
    OR name = 'geometry'
    OR name = 'trigonometry'
    OR name = 'precalculus'
    OR name = 'applications'
    OR name = 'collegeApps'
    OR name = 'collegePrep'
    OR name = 'collegeList'
    OR name = 'applicationEssays'
    OR name = 'financialAid';

UPDATE
    upchieve.quizzes
SET
    questions_per_subcategory = 3,
    updated_at = NOW()
WHERE
    name = 'essays';

UPDATE
    upchieve.quizzes
SET
    questions_per_subcategory = 4,
    updated_at = NOW()
WHERE
    name = 'planning';

UPDATE
    upchieve.quizzes
SET
    questions_per_subcategory = 27,
    updated_at = NOW()
WHERE
    name = 'upchieve101';

-- migrate:down
UPDATE
    upchieve.quizzes
SET
    questions_per_subcategory = 1,
    updated_at = NOW();


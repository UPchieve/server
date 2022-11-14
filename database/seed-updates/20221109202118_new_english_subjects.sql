-- migrate:up
-- update display name for Reading and Writing to English (readingWriting display name in Topics)
UPDATE
    upchieve.topics
SET
    display_name = 'English'
WHERE
    name = 'readingWriting';

-- add new subjects, deactivate humanitiesEssays, reorder Reading
INSERT INTO upchieve.subjects (name, display_name, display_order, topic_id, tool_type_id, created_at, updated_at)
    VALUES ('essayPlanning', 'Essay Planning', 2, 5, 2, NOW(), NOW()), ('essayFeedback', 'Essay Feedback', 3, 5, 2, NOW(), NOW());

UPDATE
    upchieve.subjects
SET
    active = FALSE
WHERE
    name = 'humanitiesEssays';

UPDATE
    upchieve.subjects
SET
    display_order = 1
WHERE
    name = 'reading';

-- add new subjects to Certifications and deactivate humanitiesEssays
INSERT INTO upchieve.certifications (name, created_at, updated_at, active)
    VALUES ('essayPlanning', NOW(), NOW(), TRUE), ('essayFeedback', NOW(), NOW(), TRUE);

UPDATE
    upchieve.certifications
SET
    active = FALSE
WHERE
    name = 'humanitiesEssays';

-- add new subjects to certification_subject_unlocks (1:1 mapping with subject mapping to itself)
INSERT INTO upchieve.certification_subject_unlocks (subject_id, certification_id, created_at, updated_at)
SELECT
    subquery.subject_id,
    subquery.certification_id,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.certifications.id AS certification_id,
        upchieve.subjects.id AS subject_id
    FROM
        upchieve.certifications
        JOIN upchieve.subjects ON upchieve.subjects.name = 'essayPlanning'
    WHERE
        upchieve.certifications.name = 'essayPlanning') AS subquery
ON CONFLICT (subject_id,
    certification_id)
    DO NOTHING
RETURNING
    subject_id AS ok;

INSERT INTO upchieve.certification_subject_unlocks (subject_id, certification_id, created_at, updated_at)
SELECT
    subquery.subject_id,
    subquery.certification_id,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.certifications.id AS certification_id,
        upchieve.subjects.id AS subject_id
    FROM
        upchieve.certifications
        JOIN upchieve.subjects ON upchieve.subjects.name = 'essayFeedback'
    WHERE
        upchieve.certifications.name = 'essayFeedback') AS subquery
ON CONFLICT (subject_id,
    certification_id)
    DO NOTHING
RETURNING
    subject_id AS ok;

-- add to quiz_certification_grants (quizzes should already exist)
INSERT INTO upchieve.quiz_certification_grants (quiz_id, certification_id, created_at, updated_at)
SELECT
    subquery.quiz_id,
    subquery.certification_id,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.quizzes.id AS quiz_id,
        upchieve.certifications.id AS certification_id
    FROM
        upchieve.certifications
        JOIN upchieve.quizzes ON upchieve.quizzes.name = 'essayPlanning'
    WHERE
        upchieve.certifications.name = 'essayPlanning') AS subquery
ON CONFLICT (quiz_id,
    certification_id)
    DO NOTHING
RETURNING
    quiz_id AS ok;

INSERT INTO upchieve.quiz_certification_grants (quiz_id, certification_id, created_at, updated_at)
SELECT
    subquery.quiz_id,
    subquery.certification_id,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.quizzes.id AS quiz_id,
        upchieve.certifications.id AS certification_id
    FROM
        upchieve.certifications
        JOIN upchieve.quizzes ON upchieve.quizzes.name = 'essayFeedback'
    WHERE
        upchieve.certifications.name = 'essayFeedback') AS subquery
ON CONFLICT (quiz_id,
    certification_id)
    DO NOTHING
RETURNING
    quiz_id AS ok;

-- presession is complicated so it's in its own migration but postsession just uses generic postsession surveys
INSERT INTO upchieve.surveys_context (survey_id, subject_id, survey_type_id, created_at, updated_at)
SELECT
    upchieve.surveys.id,
    upchieve.subjects.id,
    upchieve.survey_types.id,
    NOW(),
    NOW()
FROM
    upchieve.surveys
    JOIN upchieve.subjects ON TRUE
    JOIN upchieve.survey_types ON TRUE
WHERE (upchieve.surveys.name = 'Student Post-Session Survey'
    AND upchieve.subjects.name = 'essayPlanning'
    AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND upchieve.subjects.name = 'essayFeedback'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND upchieve.subjects.name = 'essayPlanning'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'General Volunteer Post-Session Survey'
        AND upchieve.subjects.name = 'essayFeedback'
        AND upchieve.survey_types.name = 'postsession');

-- migrate:down
DELETE FROM upchieve.certification_subject_unlocks USING upchieve.subjects
WHERE upchieve.subjects.id = upchieve.certification_subject_unlocks.subject_id
    AND upchieve.subjects.name IN ('essayPlanning', 'essayFeedback');

DELETE FROM upchieve.quiz_certification_grants USING upchieve.quizzes
WHERE upchieve.quizzes.id = upchieve.quiz_certification_grants.quiz_id
    AND upchieve.quizzes.name IN ('essayPlanning', 'essayFeedback');

UPDATE
    upchieve.topics
SET
    display_name = 'Reading and Writing'
WHERE
    name = 'readingWriting';

DELETE FROM upchieve.certifications
WHERE name IN ('essayPlanning', 'essayFeedback');

UPDATE
    upchieve.certifications
SET
    active = TRUE
WHERE
    name = 'humanitiesEssays';

DELETE FROM upchieve.subjects
WHERE name IN ('essayPlanning', 'essayFeedback');

UPDATE
    upchieve.subjects
SET
    active = TRUE
WHERE
    name = 'humanitiesEssays';

UPDATE
    upchieve.subjects
SET
    display_order = 2
WHERE
    name = 'reading';

DELETE FROM upchieve.surveys_context USING upchieve.subjects
WHERE upchieve.surveys_context.subject_id = subjects.id
    AND subjects.name IN ('essayPlanning', 'essayFeedback');


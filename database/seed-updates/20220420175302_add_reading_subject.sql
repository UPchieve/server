-- migrate:up
INSERT INTO upchieve.subjects (name, display_name, display_order, topic_id, tool_type_id, created_at, updated_at)
SELECT
    'reading',
    'Reading',
    2,
    subquery.topic_id,
    subquery.tool_type_id,
    NOW(),
    NOW()
FROM (
    SELECT
        upchieve.topics.id AS topic_id,
        upchieve.tool_types.id AS tool_type_id
    FROM
        upchieve.topics
        JOIN upchieve.tool_types ON upchieve.tool_types.name = 'documenteditor'
    WHERE
        upchieve.topics.name = 'readingWriting') AS subquery
RETURNING
    id AS ok;

INSERT INTO upchieve.certifications (name, created_at, updated_at)
    VALUES ('reading', NOW(), NOW())
ON CONFLICT ON CONSTRAINT certifications_name_key
    DO NOTHING;

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
        JOIN upchieve.subjects ON upchieve.subjects.name = 'reading'
    WHERE
        upchieve.certifications.name = 'reading') AS subquery
ON CONFLICT (subject_id,
    certification_id)
    DO NOTHING
RETURNING
    subject_id AS ok;

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
        JOIN upchieve.quizzes ON upchieve.quizzes.name = 'reading'
    WHERE
        upchieve.certifications.name = 'reading') AS subquery
ON CONFLICT (quiz_id,
    certification_id)
    DO NOTHING
RETURNING
    quiz_id AS ok;

-- migrate:down
DELETE FROM upchieve.quiz_certification_grants USING upchieve.quizzes
WHERE upchieve.quizzes.id = upchieve.quiz_certification_grants.quiz_id
    AND upchieve.quizzes.name = 'reading';

DELETE FROM upchieve.certification_subject_unlocks USING upchieve.subjects
WHERE upchieve.subjects.id = upchieve.certification_subject_unlocks.subject_id
    AND upchieve.subjects.name = 'reading';

DELETE FROM upchieve.subjects
WHERE upchieve.subjects.name = 'reading';

DELETE FROM upchieve.certifications
WHERE upchieve.certifications.name = 'reading';


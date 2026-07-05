-- migrate:up
INSERT INTO upchieve.subjects (name, display_name, display_order, topic_id, tool_type_id, created_at, updated_at)
SELECT
    new_subjects.name,
    new_subjects.display_name,
    new_subjects.display_order::int,
    topics.id,
    tool_types.id,
    NOW(),
    NOW()
FROM (
    VALUES ('apChemistry', 'AP Chemistry', 5, 'science'),
        ('apEnvironmentalScience', 'AP Environmental Science', 10, 'science'),
        ('apStatistics', 'AP Statistics', 10, 'math'),
        ('apCalculusAB', 'AP Calculus AB', 13, 'math')) AS new_subjects (name, display_name, display_order, topic_name)
    JOIN upchieve.topics ON topics.name = new_subjects.topic_name
    JOIN upchieve.tool_types ON tool_types.name = 'whiteboard'
ON CONFLICT (name)
    DO NOTHING;

INSERT INTO upchieve.certification_subject_unlocks (subject_id, certification_id, created_at, updated_at)
SELECT
    subjects.id,
    certifications.id,
    NOW(),
    NOW()
FROM (
    VALUES ('apChemistry', 'chemistry'),
        ('apEnvironmentalScience', 'environmentalScience'),
        ('apStatistics', 'statistics'),
        ('apCalculusAB', 'calculusAB')) AS unlocks (subject_name, cert_name)
    JOIN upchieve.subjects ON subjects.name = unlocks.subject_name
    JOIN upchieve.certifications ON certifications.name = unlocks.cert_name
ON CONFLICT (subject_id,
    certification_id)
    DO NOTHING;

-- migrate:down
DELETE FROM upchieve.certification_subject_unlocks
WHERE subject_id IN (
        SELECT
            id
        FROM
            upchieve.subjects
        WHERE
            name IN ('apChemistry', 'apEnvironmentalScience', 'apStatistics', 'apCalculusAB'));

DELETE FROM upchieve.subjects
WHERE name IN ('apChemistry', 'apEnvironmentalScience', 'apStatistics', 'apCalculusAB');


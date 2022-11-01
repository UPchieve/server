/* @name getSubjectAndTopic */
SELECT
    subjects.name AS subject_name,
    subjects.display_name AS subject_display_name,
    topics.name AS topic_name,
    topics.display_name AS topic_display_name
FROM
    subjects
    JOIN topics ON subjects.topic_id = topics.id
WHERE
    subjects.name = :subject!
    AND topics.name = :topic!;


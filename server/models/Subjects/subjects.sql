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


/* @name getSubjects */
SELECT
    subjects.id AS id,
    subjects.name AS name,
    subjects.display_name AS display_name,
    subjects.display_order AS display_order,
    subjects.active AS active,
    topics.name AS topic_name,
    topics.display_name AS topic_display_name,
    topics.dashboard_order AS topic_dashboard_order,
    topics.id AS topic_id,
    topics.icon_link AS topic_icon_link,
    topics.color AS topic_color
FROM
    subjects
    JOIN topics ON subjects.topic_id = topics.id;


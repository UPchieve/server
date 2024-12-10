/* @name getFeedbackBySessionId */
SELECT
    feedbacks.id,
    topics.name AS TYPE,
    subjects.name AS sub_topic,
    user_roles.name AS user_role,
    user_id,
    session_id,
    student_tutoring_feedback,
    student_counseling_feedback,
    volunteer_feedback
FROM
    feedbacks
    LEFT JOIN topics ON feedbacks.topic_id = topics.id
    LEFT JOIN subjects ON feedbacks.subject_id = subjects.id
    JOIN user_roles ON feedbacks.user_role_id = user_roles.id
WHERE
    session_id = :sessionId!;


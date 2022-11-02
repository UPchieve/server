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


/* @name getFeedbackById */
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
    feedbacks.id = :id!;


/* @name getFeedbackBySessionIdUserType */
SELECT
    feedbacks.id,
    topics.name AS TYPE,
    subjects.name AS sub_topic,
    user_roles.name AS user_role,
    user_id,
    session_id,
    student_tutoring_feedback,
    student_counseling_feedback,
    volunteer_feedback,
    legacy_feedbacks,
    legacy_feedbacks AS response_data,
    feedbacks.created_at,
    feedbacks.updated_at
FROM
    feedbacks
    LEFT JOIN topics ON feedbacks.topic_id = topics.id
    LEFT JOIN subjects ON feedbacks.subject_id = subjects.id
    JOIN user_roles ON feedbacks.user_role_id = user_roles.id
WHERE
    feedbacks.session_id = :sessionId!
    AND user_roles.name = :userRole!;


/* @name upsertFeedback */
INSERT INTO feedbacks (id, topic_id, subject_id, user_role_id, session_id, student_tutoring_feedback, student_counseling_feedback, volunteer_feedback, comment, user_id, created_at, updated_at)
SELECT
    :id!,
    subjects.topic_id,
    sessions.subject_id,
    user_roles.id,
    :sessionId!,
    :studentTutoringFeedback,
    :studentCounselingFeedback,
    :volunteerFeedback,
    :comment,
    (
        CASE WHEN :userRole! = 'student' THEN
            sessions.student_id
        ELSE
            sessions.volunteer_id
        END),
    NOW(),
    NOW()
FROM
    sessions
    LEFT JOIN subjects ON subjects.id = sessions.subject_id
    JOIN user_roles ON user_roles.name = :userRole!
WHERE
    sessions.id = :sessionId!
ON CONFLICT (user_id,
    session_id)
    DO NOTHING
RETURNING
    feedbacks.id;


/* @name getFeedbackByUserId */
SELECT
    feedbacks.id,
    topics.name AS TYPE,
    subjects.name AS sub_topic,
    user_id,
    user_roles.name AS user_role,
    session_id,
    student_tutoring_feedback,
    student_counseling_feedback,
    volunteer_feedback,
    legacy_feedbacks,
    legacy_feedbacks AS response_data,
    feedbacks.created_at,
    feedbacks.updated_at
FROM
    feedbacks
    LEFT JOIN topics ON feedbacks.topic_id = topics.id
    LEFT JOIN subjects ON feedbacks.subject_id = subjects.id
    JOIN user_roles ON feedbacks.user_role_id = user_roles.id
WHERE
    feedbacks.user_id = :userId!;


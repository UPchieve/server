/*
 @name addNotification
 */
INSERT INTO notifications (id, user_id, message_carrier_id, sent_at, type_id, method_id, priority_group_id, successful, session_id, created_at, updated_at)
SELECT
    :id!,
    :volunteer!,
    :messageCarrierId,
    NOW(),
    notification_types.id,
    notification_methods.id,
    notification_priority_groups.id,
    :wasSuccessful!,
    :sessionId!,
    NOW(),
    NOW()
FROM
    notification_types
    JOIN notification_methods ON TRUE
    LEFT JOIN notification_priority_groups ON notification_priority_groups.name = NULLIF (:priorityGroup!, '')
WHERE
    notification_types.type = :type!
    AND notification_methods.method = :method!
RETURNING
    id AS ok;


/* @name getUnfilledSessions */
SELECT
    sessions.id,
    subjects.name AS sub_topic,
    topics.name AS TYPE,
    sessions.volunteer_id AS volunteer,
    sessions.created_at,
    users.first_name AS student_first_name,
    users.test_user AS student_test_user,
    users.ban_type AS student_ban_type,
    session_count.total = 1 AS is_first_time_student,
    subjects.display_name AS subject_display_name,
    coalesce(current_grade_levels_mview.current_grade_name, grade_levels.name) AS current_grade_name
FROM
    sessions
    JOIN users ON sessions.student_id = users.id
    JOIN student_profiles ON student_profiles.user_id = sessions.student_id
    LEFT JOIN grade_levels ON grade_levels.id = student_profiles.grade_level_id
    LEFT JOIN current_grade_levels_mview ON current_grade_levels_mview.user_id = sessions.student_id
    LEFT JOIN subjects ON sessions.subject_id = subjects.id
    LEFT JOIN topics ON subjects.topic_id = topics.id
    JOIN LATERAL (
        SELECT
            COUNT(*) AS total
        FROM
            sessions
        WHERE
            student_id = users.id) AS session_count ON TRUE
WHERE
    sessions.volunteer_id IS NULL
    AND sessions.ended_at IS NULL
    AND sessions.created_at > :start!
    AND users.ban_type IS DISTINCT FROM 'complete'
ORDER BY
    sessions.created_at;


/* @name getSessionById */
SELECT
    sessions.id,
    student_id,
    volunteer_id,
    subjects.id AS subject_id,
    subjects.name AS subject,
    subjects.display_name AS subject_display_name,
    topics.name AS topic,
    has_whiteboard_doc,
    quill_doc,
    volunteer_joined_at,
    ended_at,
    user_roles.name AS ended_by_role,
    reviewed,
    to_review,
    shadowbanned,
    (time_tutored)::float,
    sessions.created_at,
    sessions.updated_at,
    session_reported_count.total <> 0 AS reported,
    COALESCE(session_flag_array.flags, ARRAY[]::text[]) AS flags,
    tool_types.name AS tool_type
FROM
    sessions
    LEFT JOIN subjects ON subjects.id = sessions.subject_id
    LEFT JOIN topics ON topics.id = subjects.topic_id
    LEFT JOIN user_roles ON user_roles.id = sessions.ended_by_role_id
    LEFT JOIN session_reports ON session_reports.session_id = sessions.id
    LEFT JOIN LATERAL (
        SELECT
            COUNT(id)::int AS total
        FROM
            session_reports
        WHERE
            session_reports.session_id = sessions.id) AS session_reported_count ON TRUE
    LEFT JOIN LATERAL (
        SELECT
            array_agg(name) AS flags
        FROM
            sessions_session_flags
            LEFT JOIN session_flags ON session_flags.id = sessions_session_flags.session_flag_id
        WHERE
            sessions_session_flags.session_id = sessions.id) AS session_flag_array ON TRUE
    JOIN tool_types ON subjects.tool_type_id = tool_types.id
WHERE
    sessions.id = :sessionId!;


/* @name insertSessionFlagsById */
INSERT INTO sessions_session_flags (session_id, session_flag_id, created_at, updated_at)
SELECT
    :sessionId!,
    session_flags.id,
    NOW(),
    NOW()
FROM
    session_flags
WHERE
    name = ANY (:flags!::text[])
ON CONFLICT (session_id,
    session_flag_id)
    DO UPDATE SET
        updated_at = NOW()
    RETURNING
        session_id AS ok;


/* @name updateSessionToReview */
UPDATE
    sessions
SET
    to_review = TRUE,
    reviewed = COALESCE(:reviewed, reviewed)
WHERE
    id = :sessionId!
RETURNING
    id AS ok;


/* @name updateSessionReviewedStatusById */
UPDATE
    sessions
SET
    reviewed = :reviewed!,
    to_review = :toReview!,
    updated_at = NOW()
WHERE
    id = :sessionId!
RETURNING
    id AS ok;


/* @name getSessionToEndById */
SELECT
    sessions.id,
    student_id,
    volunteer_id,
    subjects.name AS subject,
    topics.name AS topic,
    volunteer_joined_at,
    ended_at,
    sessions.created_at,
    sessions.updated_at,
    students.first_name AS student_first_name,
    students.email AS student_email,
    student_sessions.total AS student_num_past_sessions,
    volunteers.first_name AS volunteer_first_name,
    volunteers.email AS volunteer_email,
    volunteer_sessions.total AS volunteer_num_past_sessions,
    volunteer_partner_orgs.key AS volunteer_partner_org,
    session_reported_count.total <> 0 AS reported
FROM
    sessions
    LEFT JOIN subjects ON subjects.id = sessions.subject_id
    LEFT JOIN topics ON topics.id = subjects.topic_id
    LEFT JOIN users students ON students.id = sessions.student_id
    LEFT JOIN users volunteers ON volunteers.id = sessions.volunteer_id
    LEFT JOIN LATERAL (
        SELECT
            COUNT(id)::int AS total
        FROM
            sessions
        WHERE
            sessions.student_id = students.id) AS student_sessions ON TRUE
    LEFT JOIN LATERAL (
        SELECT
            COUNT(id)::int AS total
        FROM
            sessions
        WHERE
            sessions.volunteer_id = volunteers.id) AS volunteer_sessions ON TRUE
    LEFT JOIN LATERAL (
        SELECT
            COUNT(id)::int AS total
        FROM
            session_reports
        WHERE
            session_reports.session_id = sessions.id) AS session_reported_count ON TRUE
    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = volunteers.id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
WHERE
    sessions.id = :sessionId!;


/* @name getSessionsToReview */
SELECT
    sessions.id,
    sessions.ended_at,
    sessions.created_at,
    sessions.volunteer_id AS volunteer,
    volunteers.first_name AS volunteer_first_name,
    topics.name AS TYPE,
    subjects.name AS sub_topic,
    students.first_name AS student_first_name,
    session_reported_count.total <> 0 AS is_reported,
    flags.flags,
    messages.total AS total_messages,
    session_review_reason.review_reasons,
    sessions.to_review,
    student_feedback.student_counseling_feedback
FROM
    sessions
    LEFT JOIN subjects ON subjects.id = sessions.subject_id
    LEFT JOIN topics ON topics.id = subjects.topic_id
    LEFT JOIN users students ON students.id = sessions.student_id
    LEFT JOIN users volunteers ON volunteers.id = sessions.volunteer_id
    LEFT JOIN feedbacks student_feedback ON (student_feedback.session_id = sessions.id
            AND student_feedback.user_id = sessions.student_id)
    LEFT JOIN LATERAL (
        SELECT
            COUNT(id)::int AS total
        FROM
            session_reports
        WHERE
            session_reports.session_id = sessions.id) AS session_reported_count ON TRUE
    LEFT JOIN LATERAL (
        SELECT
            array_agg(session_flags.name) AS flags
        FROM
            sessions_session_flags
            JOIN session_flags ON session_flags.id = sessions_session_flags.session_flag_id
        WHERE
            session_id = sessions.id
        GROUP BY
            session_id) AS flags ON TRUE
    LEFT JOIN LATERAL (
        SELECT
            COUNT(id)::int AS total
        FROM
            session_messages
        WHERE
            session_messages.session_id = sessions.id) AS messages ON TRUE
    LEFT JOIN LATERAL (
        SELECT
            array_agg(session_flags.name) AS review_reasons
        FROM
            session_review_reasons
            LEFT JOIN session_flags ON session_flags.id = session_review_reasons.session_flag_id
        WHERE
            session_review_reasons.session_id = sessions.id) AS session_review_reason ON TRUE
WHERE
    sessions.to_review IS TRUE
    AND sessions.reviewed IS FALSE
    AND LOWER(students.first_name) = LOWER(COALESCE(NULLIF (:withStudentFirstName, ''), students.first_name))
ORDER BY
    (sessions.created_at) DESC
LIMIT (:limit!)::int OFFSET (:offset!)::int;


/* @name getTotalTimeTutoredForDateRange */
SELECT
    SUM(time_tutored)::bigint AS total
FROM
    sessions
WHERE
    volunteer_id = :volunteerId!
    AND created_at >= :start!
    AND created_at <= :end!;


/* @name getActiveSessionVolunteers */
SELECT
    volunteer_id
FROM
    sessions
WHERE
    ended_at IS NULL
    AND NOT volunteer_id IS NULL;


/* @name updateSessionReported */
INSERT INTO session_reports (id, report_reason_id, report_message, reporting_user_id, session_id, reported_user_id, created_at, updated_at)
SELECT
    :id!,
    report_reasons.id,
    :reportMessage!,
    sessions.volunteer_id,
    sessions.id,
    sessions.student_id,
    NOW(),
    NOW()
FROM
    sessions
    JOIN report_reasons ON report_reasons.reason = :reportReason!
WHERE
    sessions.id = :sessionId!
RETURNING
    id AS ok;


/* @name updateSessionTimeTutored */
UPDATE
    sessions
SET
    time_tutored = (:timeTutored!)::int,
    updated_at = NOW()
WHERE
    id = :sessionId!
RETURNING
    id AS ok;


/* @name updateSessionQuillDoc */
UPDATE
    sessions
SET
    quill_doc = (:quillDoc!),
    updated_at = NOW()
WHERE
    id = :sessionId!
RETURNING
    id AS ok;


/* @name updateSessionHasWhiteboardDoc */
UPDATE
    sessions
SET
    has_whiteboard_doc = (:hasWhiteboardDoc!)::boolean,
    updated_at = NOW()
WHERE
    id = :sessionId!
RETURNING
    id AS ok;


/* @name updateSessionToEnd */
UPDATE
    sessions
SET
    ended_at = :endedAt!,
    ended_by_user_id = :endedBy,
    updated_at = NOW()
WHERE
    sessions.id = :sessionId!
RETURNING
    sessions.id,
    sessions.created_at,
    sessions.ended_at,
    sessions.volunteer_joined_at,
    :endedBy::uuid AS ended_by,
    CASE WHEN sessions.volunteer_id = :endedBy::uuid THEN
        'volunteer'
    WHEN sessions.student_id = :endedBy::uuid THEN
        'student'
    ELSE
        'admin'
    END AS ended_by_user_role;


/* @name getLongRunningSessions */
SELECT
    sessions.id
FROM
    sessions
WHERE
    created_at >= :start!
    AND created_at <= :end!
    AND ended_at IS NULL;


/* @name getPublicSessionById */
SELECT
    sessions.id,
    sessions.ended_at,
    sessions.created_at,
    sessions.student_id,
    sessions.volunteer_id,
    topics.name AS TYPE,
    subjects.name AS sub_topic,
    students.first_name AS student_first_name,
    volunteers.first_name AS volunteer_first_name
FROM
    sessions
    LEFT JOIN subjects ON subjects.id = sessions.subject_id
    LEFT JOIN topics ON topics.id = subjects.topic_id
    LEFT JOIN users students ON students.id = sessions.student_id
    LEFT JOIN users volunteers ON volunteers.id = sessions.volunteer_id
WHERE
    sessions.id = :sessionId!;


/* @name getSessionForAdminView */
SELECT
    sessions.id,
    subjects.name AS sub_topic,
    topics.name AS TYPE,
    sessions.created_at,
    sessions.ended_at,
    sessions.volunteer_joined_at,
    sessions.quill_doc,
    sessions.time_tutored::int,
    (
        CASE WHEN user_roles.name = 'volunteer' THEN
            sessions.volunteer_id
        WHEN user_roles.name = 'student' THEN
            sessions.student_id
        ELSE
            NULL
        END) AS ended_by,
    session_reports.report_message,
    report_reasons.reason AS report_reason,
    session_review_reason.review_reasons,
    session_photo.photos,
    sessions.to_review,
    tool_types.name AS tool_type,
    sessions.student_id,
    sessions.volunteer_id
FROM
    sessions
    JOIN users ON sessions.student_id = users.id
    LEFT JOIN subjects ON sessions.subject_id = subjects.id
    LEFT JOIN topics ON subjects.topic_id = topics.id
    LEFT JOIN user_roles ON user_roles.id = sessions.ended_by_role_id
    LEFT JOIN (
        SELECT
            report_reason_id,
            report_message
        FROM
            session_reports
        WHERE
            session_id = :sessionId!
        ORDER BY
            created_at DESC
        LIMIT 1) AS session_reports ON TRUE
    LEFT JOIN report_reasons ON report_reasons.id = session_reports.report_reason_id
    LEFT JOIN LATERAL (
        SELECT
            array_agg(session_flags.name) AS review_reasons
        FROM
            session_review_reasons
            LEFT JOIN session_flags ON session_flags.id = session_review_reasons.session_flag_id
        WHERE
            session_review_reasons.session_id = sessions.id) AS session_review_reason ON TRUE
    LEFT JOIN LATERAL (
        SELECT
            array_agg(photo_key) AS photos
        FROM
            session_photos
        WHERE
            session_photos.session_id = sessions.id) AS session_photo ON TRUE
    JOIN tool_types ON subjects.tool_type_id = tool_types.id
WHERE
    sessions.id = :sessionId!;


/* @name getSessionMessagesForFrontend */
SELECT
    id,
    sender_id AS USER,
    contents,
    created_at,
    session_id
FROM
    session_messages
WHERE
    session_id = :sessionId!
ORDER BY
    created_at;


/* @name getSessionVoiceMessagesForFrontend */
SELECT
    id,
    sender_id AS USER,
    created_at,
    session_id,
    transcript
FROM
    session_voice_messages
WHERE
    session_id = :sessionId!
ORDER BY
    created_at;


/* @name getSessionAudioTranscriptMessagesForFrontend */
SELECT
    id,
    user_id AS USER,
    session_id,
    message,
    said_at AS created_at
FROM
    session_audio_transcript_messages
WHERE
    session_id = :sessionId!
ORDER BY
    said_at;


/* @name createSession */
WITH inserted_session AS (
INSERT INTO sessions (id, student_id, subject_id, shadowbanned, created_at, updated_at)
    SELECT
        :id!,
        :studentId!,
        subjects.id,
        :shadowbanned!,
        NOW(),
        NOW()
    FROM
        subjects
    WHERE
        subjects.name = :subject!
    RETURNING
        *
)
SELECT
    inserted_session.*,
    subjects.name AS subject,
    subjects.display_name AS subject_display_name,
    topics.name AS topic
FROM
    inserted_session
    JOIN subjects ON subjects.id = inserted_session.subject_id
    JOIN topics ON topics.id = subjects.topic_id;


/* @name getCurrentSessionByUserId */
SELECT
    sessions.id,
    subjects.name AS sub_topic,
    topics.name AS TYPE,
    sessions.created_at,
    sessions.volunteer_joined_at,
    sessions.volunteer_id,
    sessions.student_id,
    sessions.ended_at,
    tool_types.name AS tool_type,
    volunteer_profiles.languages AS volunteer_languages,
    CASE WHEN sessions.volunteer_id IS NULL THEN
        FALSE
    WHEN (
        SELECT
            ban_type
        FROM
            upchieve.users
        WHERE
            id = sessions.volunteer_id) = 'live_media' THEN
        TRUE
    ELSE
        FALSE
    END AS volunteer_banned_from_live_media, CASE WHEN (
        SELECT
            ban_type
        FROM
            upchieve.users
        WHERE
            id = sessions.student_id) = 'live_media' THEN
        TRUE
    ELSE
        FALSE
    END AS student_banned_from_live_media
FROM
    sessions
    JOIN users ON sessions.student_id = users.id
    LEFT JOIN subjects ON sessions.subject_id = subjects.id
    LEFT JOIN topics ON subjects.topic_id = topics.id
    JOIN tool_types ON subjects.tool_type_id = tool_types.id
    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = sessions.volunteer_id
WHERE (sessions.student_id = :userId!
    OR sessions.volunteer_id = :userId!)
AND sessions.ended_at IS NULL;


/* @name getRecapSessionForDmsBySessionId */
SELECT
    sessions.id,
    subjects.name AS sub_topic,
    topics.name AS TYPE,
    sessions.created_at,
    sessions.volunteer_joined_at,
    sessions.volunteer_id,
    sessions.student_id,
    sessions.ended_at,
    tool_types.name AS tool_type
FROM
    sessions
    JOIN users ON sessions.student_id = users.id
    LEFT JOIN subjects ON sessions.subject_id = subjects.id
    LEFT JOIN topics ON subjects.topic_id = topics.id
    JOIN tool_types ON subjects.tool_type_id = tool_types.id
WHERE
    sessions.id = :sessionId!
    AND sessions.ended_at IS NOT NULL;


/* @name getMessageInfoByMessageId */
SELECT
    sessions.id AS session_id,
    sessions.ended_at AS session_ended_at,
    students.id AS student_user_id,
    students.first_name AS student_first_name,
    students.email AS student_email,
    volunteers.id AS volunteer_user_id,
    volunteers.first_name AS volunteer_first_name,
    volunteers.email AS volunteer_email,
    session_messages.contents,
    session_messages.created_at,
    session_messages.sender_id,
    CASE WHEN session_messages.created_at > sessions.ended_at THEN
        TRUE
    ELSE
        FALSE
    END AS sent_after_session
FROM
    session_messages
    JOIN sessions ON session_messages.session_id = sessions.id
    JOIN users students ON students.id = sessions.student_id
    JOIN users volunteers ON volunteers.id = sessions.volunteer_id
WHERE
    session_messages.id = :messageId!
    AND sessions.ended_at IS NOT NULL;


/* @name getCurrentSessionBySessionId */
SELECT
    sessions.id,
    subjects.name AS sub_topic,
    topics.name AS TYPE,
    sessions.created_at,
    sessions.volunteer_joined_at,
    sessions.volunteer_id,
    sessions.student_id,
    sessions.ended_at,
    volunteer_profiles.languages AS volunteer_languages,
    (
        CASE WHEN user_roles.name = 'volunteer' THEN
            sessions.volunteer_id
        WHEN user_roles.name = 'student' THEN
            sessions.student_id
        ELSE
            NULL
        END) AS ended_by,
    tool_types.name AS tool_type,
    CASE WHEN sessions.volunteer_id IS NULL THEN
        FALSE
    WHEN (
        SELECT
            ban_type
        FROM
            upchieve.users
        WHERE
            id = sessions.volunteer_id) = 'live_media' THEN
        TRUE
    ELSE
        FALSE
    END AS volunteer_banned_from_live_media, CASE WHEN (
        SELECT
            ban_type
        FROM
            upchieve.users
        WHERE
            id = sessions.student_id) = 'live_media' THEN
        TRUE
    ELSE
        FALSE
    END AS student_banned_from_live_media
FROM
    sessions
    JOIN users ON sessions.student_id = users.id
    LEFT JOIN subjects ON sessions.subject_id = subjects.id
    LEFT JOIN topics ON subjects.topic_id = topics.id
    JOIN tool_types ON subjects.tool_type_id = tool_types.id
    LEFT JOIN user_roles ON user_roles.id = sessions.ended_by_role_id
    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = sessions.volunteer_id
WHERE
    sessions.id = :sessionId;


/* @name getSessionUsers */
SELECT
    users.created_at,
    users.id,
    users.first_name AS firstname,
    users.first_name,
    past_sessions.total AS past_sessions,
    cgl.current_grade_name AS grade_level
FROM
    users
    LEFT JOIN sessions ON sessions.student_id = users.id
        OR sessions.volunteer_id = users.id
    LEFT JOIN LATERAL (
        SELECT
            array_agg(sessions.id ORDER BY sessions.created_at) AS total
        FROM
            sessions
        WHERE
            sessions.student_id = users.id
            OR sessions.volunteer_id = users.id) AS past_sessions ON TRUE
    LEFT JOIN student_profiles ON student_profiles.user_id = users.id
    LEFT JOIN current_grade_levels_mview cgl ON cgl.user_id = student_profiles.user_id
WHERE
    sessions.id = :sessionId!
GROUP BY
    users.id,
    past_sessions.total,
    cgl.current_grade_name;


/* @name getLatestSession */
SELECT
    sessions.id,
    sessions.created_at,
    time_tutored::int,
    subjects.name AS subject,
    sessions.student_id,
    sessions.volunteer_id,
    sessions.ended_by_user_id,
    sessions.ended_at
FROM
    sessions
    JOIN subjects ON sessions.subject_id = subjects.id
WHERE (:role!::text = 'student'
    AND sessions.student_id = :userId!::uuid)
    OR (:role!::text = 'volunteer'
        AND sessions.volunteer_id = :userId!::uuid)
ORDER BY
    created_at DESC
LIMIT 1;


/* @name updateSessionVolunteerById */
UPDATE
    sessions
SET
    volunteer_id = :volunteerId!,
    volunteer_joined_at = NOW(),
    updated_at = NOW()
WHERE
    id = :sessionId!
    AND volunteer_id IS NULL;


/* @name insertNewMessage */
INSERT INTO session_messages (id, sender_id, contents, session_id, created_at, updated_at)
    VALUES (:id!, :senderId!, :contents!, :sessionId!, NOW(), NOW())
RETURNING
    id;


/* @name getSessionsWithAvgWaitTimePerDayAndHour */
SELECT
    extract(isodow FROM sessions.created_at)::int AS day,
    extract(hour FROM sessions.created_at)::int AS hour,
    COALESCE(AVG(
            CASE WHEN sessions.volunteer_id IS NULL THEN
                EXTRACT('epoch' FROM (sessions.ended_at - sessions.created_at))
            ELSE
                EXTRACT('epoch' FROM (sessions.volunteer_joined_at - sessions.created_at))
            END), 0)::float * 1000 AS average_wait_time -- in milliseconds
FROM
    sessions
WHERE
    sessions.created_at >= :start!
    AND sessions.created_at < :end!
    AND NOT sessions.ended_at IS NULL
    AND EXTRACT('epoch' FROM (sessions.ended_at - sessions.created_at)) > 60
GROUP BY
    day,
    hour;


/* @name getSessionsForReferCoworker */
SELECT
    sessions.id,
    feedbacks.volunteer_feedback
FROM
    sessions
    LEFT JOIN sessions_session_flags ON sessions_session_flags.session_id = sessions.id
    LEFT JOIN session_flags ON session_flags.id = sessions_session_flags.session_flag_id
    LEFT JOIN feedbacks ON feedbacks.session_id = sessions.id
        AND feedbacks.user_id = sessions.volunteer_id
WHERE
    sessions.volunteer_id = :volunteerId!
    AND sessions.time_tutored >= 15 * 60 * 1000
    AND (session_flags.name IS NULL
        OR NOT session_flags.name = ANY ('{"Absent student", "Absent volunteer"}'));


/* @name getStudentForEmailFirstSession */
SELECT
    users.id,
    users.first_name,
    users.email
FROM
    sessions
    LEFT JOIN sessions_session_flags ON sessions_session_flags.session_id = sessions.id
    LEFT JOIN session_flags ON sessions_session_flags.session_flag_id = session_flags.id
    LEFT JOIN users ON users.id = sessions.student_id
WHERE (sessions.id::uuid = :sessionId
    OR sessions.mongo_id::text = :mongoSessionId)
AND (session_flags.name IS NULL
    OR NOT session_flags.name = ANY ('{"Absent student", "Absent volunteer", "Low coach rating from student", "Low session rating from student" }'))
AND users.deactivated IS FALSE
AND users.deleted IS FALSE
AND users.test_user IS FALSE;


/* @name getVolunteerForEmailFirstSession */
SELECT
    users.id,
    users.first_name,
    users.email
FROM
    sessions
    LEFT JOIN sessions_session_flags ON sessions_session_flags.session_id = sessions.id
    LEFT JOIN session_flags ON sessions_session_flags.session_flag_id = session_flags.id
    LEFT JOIN users ON users.id = sessions.volunteer_id
WHERE (sessions.id::uuid = :sessionId
    OR sessions.mongo_id::text = :mongoSessionId)
AND (session_flags.name IS NULL
    OR NOT session_flags.name = ANY ('{"Absent student", "Absent volunteer", "Low coach rating from student", "Low session rating from student" }'))
AND users.deactivated IS FALSE
AND users.deleted IS FALSE
AND users.test_user IS FALSE;


/* @name getSessionsForAdminFilter */
SELECT
    sessions.id,
    sessions.created_at,
    sessions.ended_at,
    message_count.total AS total_messages,
    topics.name AS TYPE,
    subjects.name AS sub_topic,
    students.first_name AS student_first_name,
    students.email AS student_email,
    students.ban_type AS student_ban_type,
    students.test_user AS student_test_user,
    student_sessions.total AS student_total_past_sessions,
    volunteers.first_name AS volunteer_first_name,
    volunteers.email AS volunteer_email,
    volunteers.ban_type AS volunteer_ban_type,
    volunteers.test_user AS volunteer_test_user,
    volunteer_sessions.total AS volunteer_total_past_sessions,
    review_reasons.review_reasons
FROM
    sessions
    LEFT JOIN subjects ON subjects.id = sessions.subject_id
    LEFT JOIN topics ON topics.id = subjects.topic_id
    LEFT JOIN LATERAL (
        SELECT
            array_agg(session_flags.name) AS review_reasons
        FROM
            session_review_reasons
            LEFT JOIN session_flags ON session_flags.id = session_review_reasons.session_flag_id
        WHERE
            session_id = sessions.id) AS review_reasons ON TRUE
    LEFT JOIN LATERAL (
        SELECT
            first_name,
            id,
            email,
            ban_type,
            test_user
        FROM
            users
        WHERE
            users.id = sessions.student_id) AS students ON TRUE
    LEFT JOIN LATERAL (
        SELECT
            first_name,
            id,
            email,
            ban_type,
            test_user
        FROM
            users
        WHERE
            users.id = sessions.volunteer_id) AS volunteers ON TRUE
    LEFT JOIN LATERAL (
        SELECT
            COUNT(*)::int AS total
        FROM
            session_messages
        WHERE
            session_messages.session_id = sessions.id) AS message_count ON TRUE
    LEFT JOIN LATERAL (
        SELECT
            COUNT(id)::int AS total
        FROM
            session_reports
        WHERE
            sessions.id = session_reports.session_id) AS session_reported_count ON TRUE
    LEFT JOIN LATERAL (
        SELECT
            COUNT(id)::int AS total
        FROM
            sessions
        WHERE
            sessions.student_id = students.id) AS student_sessions ON TRUE
    LEFT JOIN LATERAL (
        SELECT
            COUNT(id)::int AS total
        FROM
            sessions
        WHERE
            sessions.volunteer_id = volunteers.id) AS volunteer_sessions ON TRUE
    LEFT JOIN LATERAL (
        SELECT
            MAX(created_at) AS last_banned_at
        FROM
            user_actions
        WHERE
            user_actions.user_id = sessions.student_id
            AND user_actions.action = 'BANNED') AS student_banned ON TRUE
WHERE
    NOT sessions.ended_at IS NULL
    AND sessions.created_at >= :start!
    AND sessions.created_at <= :end!
    AND ((:messageCount)::int IS NULL
        OR message_count.total >= (:messageCount)::int)
    AND ((:sessionLength)::int IS NULL
        OR (EXTRACT('epoch' FROM (sessions.ended_at - sessions.created_at)) / 60) > (:sessionLength)::int)
    AND ((:reported)::boolean IS NULL
        OR (:reported)::boolean IS FALSE
        OR session_reported_count.total > 0)
    AND (student_banned.last_banned_at IS NULL
        OR sessions.created_at < student_banned.last_banned_at
        OR sessions.shadowbanned IS FALSE
        OR (:showBannedUsers)::boolean IS TRUE)
    AND ((:showTestUsers)::boolean IS NULL
        OR (:showTestUsers)::boolean IS TRUE
        OR students.test_user IS FALSE)
    AND ((:firstTimeStudent)::boolean IS NULL
        OR (:firstTimeStudent)::boolean IS FALSE
        OR student_sessions.total = 1)
    AND ((:firstTimeVolunteer)::boolean IS NULL
        OR (:firstTimeVolunteer)::boolean IS FALSE
        OR volunteer_sessions.total = 1)
ORDER BY
    (sessions.created_at) DESC
LIMIT (:limit!)::int OFFSET (:offset!)::int;


/* @name insertSessionReviewReasons */
INSERT INTO session_review_reasons (session_id, session_flag_id, created_at, updated_at)
SELECT
    :sessionId!,
    session_flags.id,
    NOW(),
    NOW()
FROM
    session_flags
WHERE
    session_flags.name = ANY (:reviewReasons!::text[])
ON CONFLICT (session_id,
    session_flag_id)
    DO UPDATE SET
        updated_at = NOW()
    RETURNING
        session_id AS ok;


/* @name insertSessionFailedJoin */
INSERT INTO session_failed_joins (session_id, user_id, created_at, updated_at)
    VALUES (:sessionId!, :userId!, NOW(), NOW())
RETURNING
    session_id AS ok;


/* @name insertSessionPhotoKey */
INSERT INTO session_photos (session_id, photo_key, created_at, updated_at)
    VALUES (:sessionId!, :photoKey!, NOW(), NOW())
RETURNING
    session_id AS ok;


/* @name getSessionsForVolunteerHourSummary */
SELECT
    sessions.id AS session_id,
    sessions.created_at AS created_at,
    sessions.ended_at AS ended_at,
    sessions.time_tutored::int AS time_tutored,
    subjects.name AS subject,
    topics.name AS topic,
    sessions.volunteer_joined_at AS volunteer_joined_at
FROM
    sessions
    JOIN subjects ON subjects.id = sessions.subject_id
    JOIN topics ON topics.id = subjects.topic_id
    JOIN users ON users.id = sessions.student_id
WHERE
    sessions.created_at >= :start!
    AND sessions.created_at <= :end!
    AND sessions.ended_at IS NOT NULL
    AND sessions.volunteer_id = :volunteerId!
    AND users.test_user = FALSE;


/* @name getFilteredSessionHistory */
WITH sessions AS (
    SELECT
        id,
        time_tutored,
        volunteer_id,
        student_id,
        subject_id,
        ended_at,
        created_at
    FROM
        sessions
    WHERE
        student_id = :userId!
        OR volunteer_id = :userId!
)
SELECT
    sessions.id,
    sessions.created_at AS created_at,
    sessions.time_tutored::int AS time_tutored,
    subjects.display_name AS subject,
    topics.name AS topic,
    topics.icon_link AS topic_icon_link,
    volunteers.first_name AS volunteer_first_name,
    students.first_name AS student_first_name,
    sessions.volunteer_id,
    sessions.student_id,
    (
        CASE WHEN favorited.volunteer_id = sessions.volunteer_id THEN
            TRUE
        ELSE
            FALSE
        END) AS is_favorited
FROM
    sessions
    JOIN subjects ON subjects.id = sessions.subject_id
    JOIN topics ON topics.id = subjects.topic_id
    LEFT JOIN users volunteers ON sessions.volunteer_id = volunteers.id
    LEFT JOIN users students ON sessions.student_id = students.id
    LEFT JOIN student_favorite_volunteers favorited ON (students.id = favorited.student_id
            AND volunteers.id = favorited.volunteer_id)
WHERE
    sessions.time_tutored IS NOT NULL
    AND sessions.time_tutored > :minSessionLength!::int
    AND sessions.volunteer_id IS NOT NULL
    AND sessions.ended_at IS NOT NULL
    AND sessions.student_id = coalesce(:studentId::uuid, sessions.student_id)
    AND sessions.volunteer_id = coalesce(:volunteerId::uuid, sessions.volunteer_id)
    AND (:studentFirstName::text IS NULL
        OR LOWER(students.first_name) = LOWER(:studentFirstName))
    AND (:volunteerFirstName::text IS NULL
        OR LOWER(volunteers.first_name) = LOWER(:volunteerFirstName))
    AND (:subjectName::text IS NULL
        OR subjects.name = :subjectName)
ORDER BY
    created_at DESC;


/* @name getFilteredSessionHistoryTotalCount */
WITH sessions AS (
    SELECT
        id,
        time_tutored,
        volunteer_id,
        student_id,
        subject_id,
        ended_at,
        created_at
    FROM
        sessions
    WHERE
        student_id = :userId!
        OR volunteer_id = :userId!
)
SELECT
    COUNT(*)::int
FROM
    sessions
    JOIN subjects ON subjects.id = sessions.subject_id
    JOIN topics ON topics.id = subjects.topic_id
    LEFT JOIN users volunteers ON sessions.volunteer_id = volunteers.id
    LEFT JOIN users students ON sessions.student_id = students.id
    LEFT JOIN student_favorite_volunteers favorited ON (students.id = favorited.student_id
            AND volunteers.id = favorited.volunteer_id)
WHERE
    sessions.time_tutored IS NOT NULL
    AND sessions.time_tutored > :minSessionLength!::int
    AND sessions.volunteer_id IS NOT NULL
    AND sessions.ended_at IS NOT NULL
    AND sessions.student_id = coalesce(:studentId::uuid, sessions.student_id)
    AND sessions.volunteer_id = coalesce(:volunteerId::uuid, sessions.volunteer_id)
    AND (:studentFirstName::text IS NULL
        OR LOWER(students.first_name) = LOWER(:studentFirstName))
    AND (:volunteerFirstName::text IS NULL
        OR LOWER(volunteers.first_name) = LOWER(:volunteerFirstName))
    AND (:subjectName::text IS NULL
        OR subjects.name = :subjectName);


/* @name isEligibleForSessionRecap */
SELECT
    CASE WHEN sessions.id IS NOT NULL THEN
        TRUE
    ELSE
        FALSE
    END AS is_eligible
FROM
    sessions
WHERE
    sessions.id = :sessionId!
    AND sessions.volunteer_id IS NOT NULL
    AND sessions.ended_at IS NOT NULL
    AND EXISTS (
        SELECT
            1
        FROM
            session_messages
        WHERE
            session_id = sessions.id
            AND sender_id = sessions.volunteer_id)
    AND EXISTS (
        SELECT
            1
        FROM
            session_messages
        WHERE
            session_id = sessions.id
            AND sender_id = sessions.student_id);


/* @name getTotalSessionHistory */
SELECT
    count(*)::int AS total
FROM
    sessions
    LEFT JOIN users volunteers ON sessions.volunteer_id = volunteers.id
    LEFT JOIN users students ON sessions.student_id = students.id
WHERE (students.id = :userId!
    OR volunteers.id = :userId!)
AND sessions.time_tutored IS NOT NULL
AND sessions.time_tutored > :minSessionLength!::int
AND sessions.volunteer_id IS NOT NULL;


/* @name getSessionRecap */
SELECT
    sessions.id,
    sessions.created_at,
    sessions.ended_at,
    sessions.time_tutored::int,
    subjects.display_name AS subject,
    subjects.name AS subject_key,
    topics.name AS topic,
    topics.icon_link AS topic_icon_link,
    volunteers.first_name AS volunteer_first_name,
    volunteers.id AS volunteer_id,
    students.id AS student_id,
    students.first_name AS student_first_name,
    (
        CASE WHEN favorited.volunteer_id = sessions.volunteer_id THEN
            TRUE
        ELSE
            FALSE
        END) AS is_favorited,
    sessions.quill_doc,
    sessions.has_whiteboard_doc
FROM
    sessions
    JOIN subjects ON subjects.id = sessions.subject_id
    JOIN topics ON topics.id = subjects.topic_id
    LEFT JOIN users volunteers ON sessions.volunteer_id = volunteers.id
    LEFT JOIN users students ON sessions.student_id = students.id
    LEFT JOIN student_favorite_volunteers favorited ON students.id = favorited.student_id
        AND volunteers.id = favorited.volunteer_id
WHERE
    sessions.id = :sessionId!;


/* @name volunteerSentMessageAfterSessionEnded */
SELECT
    session_messages.id
FROM
    sessions
    JOIN session_messages ON sessions.id = session_messages.session_id
WHERE
    sessions.id = :sessionId
    AND session_messages.sender_id = sessions.volunteer_id
    AND session_messages.created_at > sessions.ended_at
LIMIT 1;


/* @name sessionHasBannedParticipant */
SELECT
    sessions.id
FROM
    sessions
    JOIN student_profiles ON student_profiles.user_id = sessions.student_id
    JOIN users students ON student_profiles.user_id = students.id
    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = sessions.volunteer_id
    JOIN users volunteers ON volunteer_profiles.user_id = volunteers.id
WHERE
    sessions.id = :sessionId!
    AND (students.ban_type = 'complete'
        OR volunteers.ban_type = 'complete')
LIMIT 1;


/* @name getUserSessionsByUserId */
SELECT
    sessions.id,
    sessions.created_at,
    subjects.name AS subject_name,
    topics.name AS topic_name,
    quill_doc,
    sessions.student_id,
    sessions.volunteer_id,
    tool_types.name AS tool_type
FROM
    sessions
    JOIN subjects ON subjects.id = sessions.subject_id
    JOIN topics ON topics.id = subjects.topic_id
    JOIN tool_types ON subjects.tool_type_id = tool_types.id
WHERE (sessions.student_id = :userId!
    OR sessions.volunteer_id = :userId!)
AND ((:start)::timestamptz IS NULL
    OR sessions.created_at >= (:start)::timestamptz)
AND ((:end)::timestamptz IS NULL
    OR sessions.created_at <= (:end)::timestamptz)
AND ((:subject)::text IS NULL
    OR subjects.name = (:subject!)::text)
AND (:sessionId::uuid IS NULL
    OR sessions.id = :sessionId::uuid)
AND ((:topic)::text IS NULL
    OR topics.name = (:topic)::text)
ORDER BY
    sessions.created_at DESC;


/* @name getUserSessionStats */
SELECT
    subjects.name AS subject_name,
    topics.name AS topic_name,
    COUNT(sessions.id)::int AS total_requested,
    SUM(
        CASE WHEN sessions.time_tutored >= :minSessionLength!::int THEN
            1
        ELSE
            0
        END)::int AS total_helped
FROM
    subjects
    JOIN topics ON topics.id = subjects.topic_id
    LEFT JOIN sessions ON subjects.id = sessions.subject_id
        AND (sessions.student_id = :userId!
            OR sessions.volunteer_id = :userId!)
WHERE
    subjects.active IS TRUE
GROUP BY
    subjects.name,
    topics.name;


/* @name getStudentSessionDetails */
SELECT
    sessions.id,
    sessions.volunteer_id,
    subjects.name,
    sessions.ended_at,
    sessions.created_at,
    users.first_name,
    users.last_name,
    COUNT(session_id) AS message_count
FROM
    sessions
    LEFT JOIN session_messages ON sessions.id = session_id
    JOIN subjects ON sessions.subject_id = subjects.id
    JOIN users ON sessions.student_id = users.id
WHERE
    student_id = :studentId!
    AND sessions.ended_at IS NOT NULL
GROUP BY
    sessions.id,
    sessions.volunteer_id,
    subjects.name,
    sessions.ended_at,
    sessions.created_at,
    users.first_name,
    users.last_name;


/* @name getTutorBotSessionMessagesBySessionId */
SELECT
    *
FROM
    tutor_bot_session_messages
WHERE
    session_id = :sessionId!
ORDER BY
    created_at ASC;


/* @name insertTutorBotSessionMessage */
INSERT INTO tutor_bot_session_messages (id, session_id, message, tutor_bot_session_user_type)
    VALUES (:id!, :sessionId!, :message!, :userType!)
RETURNING
    id, session_id, message, tutor_bot_session_user_type, created_at;


/* @name getSessionTranscript */
SELECT
    sm.id AS message_id,
    sender_id AS user_id,
    contents AS message,
    sm.created_at,
    CASE WHEN sm.created_at > s.ended_at THEN
        'direct_message'
    ELSE
        'session_message'
    END AS message_type,
    CASE WHEN s.volunteer_id = sm.sender_id THEN
        'volunteer'
    ELSE
        'student'
    END AS ROLE
FROM
    session_messages sm
    JOIN sessions s ON sm.session_id = s.id
WHERE
    sm.session_id = :sessionId!
UNION
SELECT
    satm.id AS message_id,
    satm.user_id,
    satm.message,
    satm.said_at AS created_at,
    CASE WHEN TRUE THEN
        'transcription'
    END AS message_type,
    CASE WHEN s.volunteer_id = satm.user_id THEN
        'volunteer'
    ELSE
        'student'
    END AS ROLE
FROM
    session_audio_transcript_messages satm
    JOIN sessions s ON satm.session_id = s.id
WHERE
    satm.session_id = :sessionId!
UNION
SELECT
    svm.id AS message_id,
    svm.sender_id AS user_id,
    svm.transcript AS message,
    svm.created_at,
    CASE WHEN TRUE THEN
        'voice_message'
    END AS message_type,
    CASE WHEN s.volunteer_id = svm.sender_id THEN
        'volunteer'
    ELSE
        'student'
    END AS ROLE
FROM
    session_voice_messages svm
    JOIN sessions s ON svm.session_id = s.id
WHERE
    svm.session_id = :sessionId!
ORDER BY
    created_at ASC;


/* @name getUniqueStudentsHelpedCount */
SELECT
    COUNT(DISTINCT student_id)::int AS total
FROM
    sessions
WHERE
    volunteer_id = :userId!
    AND time_tutored >= :minSessionLength!::int
    AND ended_at IS NOT NULL;


/* @name isSessionFulfilled */
SELECT
    EXISTS (
        SELECT
            1
        FROM
            sessions
        WHERE
            id = :sessionId!
            AND (volunteer_joined_at IS NOT NULL
                OR ended_at IS NOT NULL)) AS is_fulfilled;


/* @name getVolunteersInSessions */
SELECT
    volunteer_id
FROM
    sessions
WHERE
    volunteer_joined_at IS NOT NULL
    AND volunteer_id IS NOT NULL
    AND ended_at IS NULL;


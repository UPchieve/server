/* @name createConversationIfEligible */
INSERT INTO direct_message_conversations (id, student_id, volunteer_id, created_at, updated_at)
SELECT
    :id!,
    :studentId!,
    :volunteerId!,
    NOW(),
    NOW()
WHERE
    EXISTS (
        SELECT
            1
        FROM
            sessions
        WHERE
            student_id = :studentId!
            AND volunteer_id = :volunteerId!
            AND ended_at IS NOT NULL
            AND time_tutored > :minSessionLength!)
ON CONFLICT (volunteer_id,
    student_id)
    DO NOTHING;


/* @name getConversationByParticipants */
SELECT
    id,
    student_id,
    volunteer_id,
    student_last_seen,
    volunteer_last_seen,
    created_at
FROM
    direct_message_conversations
WHERE
    student_id = :studentId!
    AND volunteer_id = :volunteerId!;


/* @name getConversationForParticipant */
SELECT
    id,
    student_id,
    volunteer_id,
    student_last_seen,
    volunteer_last_seen,
    created_at
FROM
    direct_message_conversations
WHERE
    id = :conversationId!
    AND (student_id = :userId!
        OR volunteer_id = :userId!);


/* @name createDirectMessage */
INSERT INTO direct_messages (id, conversation_id, sender_id, contents, sent_while_shadowbanned, created_at, updated_at)
    VALUES (:id!, :conversationId!, :senderId!, :contents!, :sentWhileShadowbanned!, NOW(), NOW())
RETURNING
    id, conversation_id, sender_id, contents, sent_while_shadowbanned, created_at;


/* @name getDirectMessagesForConversation */
SELECT
    id,
    conversation_id,
    sender_id,
    contents,
    sent_while_shadowbanned,
    created_at
FROM
    direct_messages
WHERE
    conversation_id = :conversationId!
    AND (sent_while_shadowbanned IS NOT TRUE
        OR sender_id = :viewerId!)
ORDER BY
    created_at;


/* @name updateConversationLastSeen */
UPDATE
    direct_message_conversations
SET
    student_last_seen = CASE WHEN student_id = :userId! THEN
        NOW()
    ELSE
        student_last_seen
    END,
    volunteer_last_seen = CASE WHEN volunteer_id = :userId! THEN
        NOW()
    ELSE
        volunteer_last_seen
    END
WHERE
    id = :conversationId!
    AND (student_id = :userId!
        OR volunteer_id = :userId!)
RETURNING
    id;


/* @name getUnreadDirectMessageSenderIds */
SELECT
    unread.sender_id
FROM
    direct_message_conversations dmc
    CROSS JOIN LATERAL (
        SELECT
            dm.sender_id
        FROM
            direct_messages dm
        WHERE
            dm.conversation_id = dmc.id
            AND dm.created_at > COALESCE(
                CASE WHEN dmc.student_id = :userId! THEN
                    dmc.student_last_seen
                ELSE
                    dmc.volunteer_last_seen
                END, '-infinity')
            AND dm.sender_id != :userId!
            AND dm.sent_while_shadowbanned IS NOT TRUE
        LIMIT 1) unread
WHERE
    dmc.student_id = :userId!
    OR dmc.volunteer_id = :userId!;


/* @name getPendingReviewCount */
SELECT
    COUNT(DISTINCT conversation_id)::int AS count
FROM
    direct_message_flags
WHERE
    reviewed_at IS NULL;


/* @name getPendingReviewConversations */
SELECT
    direct_message_conversations.id,
    direct_message_conversations.student_id,
    direct_message_conversations.volunteer_id,
    students.first_name AS student_name,
    volunteers.first_name AS volunteer_name,
    MIN(direct_message_flags.created_at) AS oldest_flag_at,
    COUNT(*)::int AS pending_flags,
    array_agg(DISTINCT session_flags.name) AS reasons
FROM
    direct_message_flags
    JOIN direct_message_conversations ON direct_message_conversations.id = direct_message_flags.conversation_id
    JOIN users students ON students.id = direct_message_conversations.student_id
    JOIN users volunteers ON volunteers.id = direct_message_conversations.volunteer_id
    JOIN session_flags ON session_flags.id = direct_message_flags.session_flag_id
WHERE
    direct_message_flags.reviewed_at IS NULL
GROUP BY
    direct_message_conversations.id,
    students.first_name,
    volunteers.first_name
ORDER BY
    oldest_flag_at,
    direct_message_conversations.id
LIMIT :limit! OFFSET :offset!;


/* @name getConversationForReview */
SELECT
    direct_message_conversations.id,
    direct_message_conversations.student_id,
    direct_message_conversations.volunteer_id,
    students.first_name AS student_name,
    volunteers.first_name AS volunteer_name
FROM
    direct_message_conversations
    JOIN users students ON students.id = direct_message_conversations.student_id
    JOIN users volunteers ON volunteers.id = direct_message_conversations.volunteer_id
WHERE
    direct_message_conversations.id = :conversationId!;


/* @name getPendingReviewFlags */
SELECT
    direct_message_flags.id,
    session_flags.name AS category,
    direct_message_flags.created_at,
    censored_direct_messages.message AS censored_message,
    censored_direct_messages.sender_id,
    censored_direct_messages.blocked,
    censored_direct_messages.censored_by,
    censored_direct_messages.reasons,
    direct_message_reports.report_message,
    report_reasons.reason AS report_reason,
    direct_message_reports.reporting_user_id,
    direct_message_reports.reported_user_id
FROM
    direct_message_flags
    JOIN session_flags ON session_flags.id = direct_message_flags.session_flag_id
    LEFT JOIN censored_direct_messages ON censored_direct_messages.id = direct_message_flags.censored_message_id
    LEFT JOIN direct_message_reports ON direct_message_reports.id = direct_message_flags.report_id
    LEFT JOIN report_reasons ON report_reasons.id = direct_message_reports.report_reason_id
WHERE
    direct_message_flags.conversation_id = :conversationId!
    AND direct_message_flags.reviewed_at IS NULL
ORDER BY
    direct_message_flags.created_at,
    direct_message_flags.id;


/* @name getMessagesForReview */
SELECT
    id,
    sender_id,
    contents,
    created_at
FROM
    direct_messages
WHERE
    conversation_id = :conversationId!
    AND (:beforeId::uuid IS NULL
        OR (created_at,
            id) < (
            SELECT
                created_at,
                id
            FROM
                direct_messages
            WHERE
                id = :beforeId::uuid
                AND conversation_id = :conversationId!))
ORDER BY
    created_at DESC,
    id DESC
LIMIT :limit!;


/* @name markFlagsReviewed */
UPDATE
    direct_message_flags
SET
    reviewed_at = NOW(),
    updated_at = NOW()
WHERE
    conversation_id = :conversationId!
    AND id = ANY (:flagIds!)
    AND reviewed_at IS NULL
RETURNING
    id;


/* @name getUnreadDirectMessageCount */
SELECT
    COUNT(dm.id)::int AS count
FROM
    direct_message_conversations dmc
    JOIN direct_messages dm ON dm.conversation_id = dmc.id
WHERE (dmc.student_id = :userId!
    OR dmc.volunteer_id = :userId!)
AND dm.sender_id != :userId!
AND dm.sent_while_shadowbanned IS NOT TRUE
AND dm.created_at > COALESCE(
    CASE WHEN dmc.student_id = :userId! THEN
        dmc.student_last_seen
    ELSE
        dmc.volunteer_last_seen
    END, '-infinity');


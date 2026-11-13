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


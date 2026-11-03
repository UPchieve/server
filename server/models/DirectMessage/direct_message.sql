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
INSERT INTO direct_messages (id, conversation_id, sender_id, contents, created_at, updated_at)
    VALUES (:id!, :conversationId!, :senderId!, :contents!, NOW(), NOW())
RETURNING
    id, conversation_id, sender_id, contents, created_at;


/* @name getDirectMessagesForConversation */
SELECT
    id,
    conversation_id,
    sender_id,
    contents,
    created_at
FROM
    direct_messages
WHERE
    conversation_id = :conversationId!
ORDER BY
    created_at;


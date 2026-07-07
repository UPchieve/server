/* @name getTutorBotConversationById */
SELECT
    id,
    user_id,
    session_id,
    created_at,
    subject_id
FROM
    tutor_bot_conversations
WHERE
    id = :conversationId!;


/* @name getTutorBotConversationBySessionId */
SELECT
    id,
    user_id,
    session_id,
    created_at,
    subject_id
FROM
    tutor_bot_conversations
WHERE
    session_id = :sessionId!;


/* @name getTutorBotConversationMessagesById */
SELECT
    tutor_bot_conversation_id,
    user_id,
    sender_user_type,
    message,
    created_at
FROM
    tutor_bot_conversation_messages
WHERE
    tutor_bot_conversation_id = :conversationId!
ORDER BY
    created_at ASC;


/* @name insertTutorBotConversation */
INSERT INTO tutor_bot_conversations (id, user_id, session_id, created_at, updated_at, subject_id)
    VALUES (:id!, :userId!, :sessionId, NOW(), NOW(), :subjectId!)
RETURNING
    id;


/* @name insertTutorBotConversationMessage */
INSERT INTO tutor_bot_conversation_messages (tutor_bot_conversation_id, user_id, sender_user_type, message, created_at)
    VALUES (:conversationId!, :userId!, :senderUserType!, :message!, CLOCK_TIMESTAMP())
RETURNING
    tutor_bot_conversation_id, user_id, sender_user_type, message, created_at;


/* @name updateTutorBotConversationSessionId */
UPDATE
    tutor_bot_conversations
SET
    session_id = :sessionId!,
    updated_at = NOW()
WHERE
    id = :conversationId!::uuid
    AND session_id IS NULL;


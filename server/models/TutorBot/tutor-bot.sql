/* @name getTutorBotConversationsByUserId */
WITH ranked_on_created_at AS (
    SELECT
        tbcm.*,
        row_number() OVER (PARTITION BY tbcm.tutor_bot_conversation_id ORDER BY tbcm.created_at) AS rn
    FROM
        tutor_bot_conversation_messages tbcm
        JOIN tutor_bot_conversations tbc ON tbc.id = tbcm.tutor_bot_conversation_id
    WHERE
        tbc.user_id = :userId!
)
SELECT
    tbc.*,
    ranked.message AS message_preview
FROM
    tutor_bot_conversations tbc
    JOIN ranked_on_created_at ranked ON ranked.tutor_bot_conversation_id = tbc.id
        AND ranked.rn = 1
WHERE
    tbc.user_id = :userId!;


/* @name getTutorBotConversationById */
SELECT
    *
FROM
    tutor_bot_conversations
WHERE
    id = :conversationId!;


/* @name getTutorBotConversationBySessionId */
SELECT
    *
FROM
    tutor_bot_conversations
WHERE
    session_id = :sessionId!;


/* @name getTutorBotConversationMessagesById */
SELECT
    *
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


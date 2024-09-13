/* @name getTutorBotConversationsByUserId */
SELECT
    *
FROM
    tutor_bot_conversations
WHERE
    user_id = :userId!;


/* @name getTutorBotConversationMessagesByConversationId */
SELECT
    *
FROM
    tutor_bot_conversation_messages
WHERE
    tutor_bot_conversation_id = :conversationId!;


/* @name getTutorBotConversationById */
SELECT
    *
FROM
    upchieve.tutor_bot_conversation_messages
WHERE
    tutor_bot_conversation_id = :conversationId
ORDER BY
    created_at ASC;


/* @name insertTutorBotConversationMessage */
INSERT INTO tutor_bot_conversation_messages (tutor_bot_conversation_id, user_id, sender_user_type, message, created_at)
    VALUES (:conversationId!, :userId!, :senderUserType!, :message!, NOW());


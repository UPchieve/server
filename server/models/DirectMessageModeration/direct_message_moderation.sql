/* @name createCensoredDirectMessage */
INSERT INTO censored_direct_messages (id, conversation_id, sender_id, message, censored_by, reasons, blocked)
    VALUES (:id!, :conversationId!, :senderId!, :message!, :censoredBy!, :reasons!::text[], :blocked!)
RETURNING
    id;


/* @name createDirectMessageFlag */
INSERT INTO direct_message_flags (id, conversation_id, session_flag_id, censored_message_id)
SELECT
    :id!,
    censored.conversation_id,
    flags.id,
    censored.id
FROM
    censored_direct_messages censored
    JOIN session_flags flags ON flags.name = :flagName!
WHERE
    censored.id = :censoredMessageId!
    AND censored.conversation_id = :conversationId!
RETURNING
    id;


/* @name getRecentMessages */
SELECT
    id,
    sender_id,
    contents,
    created_at
FROM
    direct_messages
WHERE
    conversation_id = :conversationId!
ORDER BY
    created_at DESC,
    id DESC
LIMIT :limit!;


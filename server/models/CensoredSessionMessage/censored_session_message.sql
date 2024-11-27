/* @name createCensoredMessage */
INSERT INTO censored_session_messages (id, sender_id, message, session_id, censored_by, sent_at, shown)
    VALUES (:id!, :senderId!, :message!, :sessionId!, :censoredBy!, :sentAt!, :shown!)
RETURNING
    id, sender_id, message, session_id, censored_by, sent_at, shown;


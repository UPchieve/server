-- migrate:up
ALTER TABLE upchieve.direct_message_conversations
    ADD COLUMN student_last_seen timestamptz,
    ADD COLUMN volunteer_last_seen timestamptz;

COMMENT ON COLUMN upchieve.direct_message_conversations.student_last_seen IS 'not_pii: When the student last viewed the conversation';

COMMENT ON COLUMN upchieve.direct_message_conversations.volunteer_last_seen IS 'not_pii: When the volunteer last viewed the conversation';

-- migrate:down
ALTER TABLE upchieve.direct_message_conversations
    DROP COLUMN volunteer_last_seen,
    DROP COLUMN student_last_seen;


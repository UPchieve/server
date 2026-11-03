-- migrate:up
ALTER TYPE upchieve.moderation_system
    ADD VALUE IF NOT EXISTS 'ai';

CREATE TABLE upchieve.censored_direct_messages (
    id uuid PRIMARY KEY,
    conversation_id uuid NOT NULL REFERENCES upchieve.direct_message_conversations (id),
    sender_id uuid NOT NULL REFERENCES upchieve.users (id),
    message text NOT NULL,
    censored_by upchieve.moderation_system NOT NULL,
    reasons text[] NOT NULL,
    blocked boolean NOT NULL,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX censored_direct_messages_conversation_id_created_at_idx ON upchieve.censored_direct_messages (conversation_id, created_at);

COMMENT ON TABLE upchieve.censored_direct_messages IS 'DM message attempts recorded during moderation, following censored_session_messages';

COMMENT ON COLUMN upchieve.censored_direct_messages.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.censored_direct_messages.conversation_id IS 'not_pii: Foreign key';

COMMENT ON COLUMN upchieve.censored_direct_messages.sender_id IS 'not_pii: Foreign key';

COMMENT ON COLUMN upchieve.censored_direct_messages.message IS 'not_pii: Message text content';

COMMENT ON COLUMN upchieve.censored_direct_messages.censored_by IS 'not_pii: Check that raised the concern, regex or ai; not necessarily the final decision maker';

COMMENT ON COLUMN upchieve.censored_direct_messages.reasons IS 'not_pii: Moderation reason/category names, without the raw provider response';

COMMENT ON COLUMN upchieve.censored_direct_messages.blocked IS 'not_pii: Whether the final moderation decision rejected delivery; independent of staff review and ban handling';

COMMENT ON COLUMN upchieve.censored_direct_messages.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.censored_direct_messages.updated_at IS 'not_pii';

-- migrate:down
DROP TABLE upchieve.censored_direct_messages;


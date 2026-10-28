-- migrate:up
CREATE TABLE upchieve.direct_messages (
    id uuid PRIMARY KEY,
    conversation_id uuid NOT NULL REFERENCES upchieve.direct_message_conversations (id),
    sender_id uuid NOT NULL REFERENCES upchieve.users (id),
    contents text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX direct_messages_conversation_id_created_at ON upchieve.direct_messages (conversation_id, created_at);

COMMENT ON COLUMN upchieve.direct_messages.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.direct_messages.conversation_id IS 'not_pii: Foreign key';

COMMENT ON COLUMN upchieve.direct_messages.sender_id IS 'not_pii: Foreign key';

COMMENT ON COLUMN upchieve.direct_messages.contents IS 'not_pii: Text content of the chat message';

COMMENT ON COLUMN upchieve.direct_messages.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.direct_messages.updated_at IS 'not_pii';

-- migrate:down
DROP TABLE upchieve.direct_messages;


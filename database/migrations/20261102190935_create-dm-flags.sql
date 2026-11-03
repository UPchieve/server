-- migrate:up
CREATE TABLE upchieve.direct_message_flags (
    id uuid PRIMARY KEY,
    conversation_id uuid NOT NULL REFERENCES upchieve.direct_message_conversations (id),
    session_flag_id int NOT NULL REFERENCES upchieve.session_flags (id),
    censored_message_id uuid REFERENCES upchieve.censored_direct_messages (id),
    reviewed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX direct_message_flags_pending_idx ON upchieve.direct_message_flags (created_at, id)
WHERE
    reviewed_at IS NULL;

CREATE INDEX direct_message_flags_conversation_id_idx ON upchieve.direct_message_flags (conversation_id);

COMMENT ON TABLE upchieve.direct_message_flags IS 'Individual DM findings for human review using shared session_flags categories';

COMMENT ON COLUMN upchieve.direct_message_flags.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.direct_message_flags.conversation_id IS 'not_pii: Foreign key';

COMMENT ON COLUMN upchieve.direct_message_flags.session_flag_id IS 'not_pii: Shared flag category';

COMMENT ON COLUMN upchieve.direct_message_flags.censored_message_id IS 'not_pii: Optional moderated attempt associated with the finding, including blocked content';

COMMENT ON COLUMN upchieve.direct_message_flags.reviewed_at IS 'not_pii: Null until reviewed';

COMMENT ON COLUMN upchieve.direct_message_flags.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.direct_message_flags.updated_at IS 'not_pii';

-- migrate:down
DROP TABLE upchieve.direct_message_flags;


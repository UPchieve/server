-- migrate:up
CREATE TABLE upchieve.direct_message_conversations (
    id uuid PRIMARY KEY,
    volunteer_id uuid NOT NULL REFERENCES upchieve.users (id),
    student_id uuid NOT NULL REFERENCES upchieve.users (id),
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW(),
    UNIQUE (volunteer_id, student_id)
);

CREATE INDEX direct_message_conversations_student_id ON upchieve.direct_message_conversations (student_id);

COMMENT ON COLUMN upchieve.direct_message_conversations.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.direct_message_conversations.volunteer_id IS 'not_pii: Foreign key';

COMMENT ON COLUMN upchieve.direct_message_conversations.student_id IS 'not_pii: Foreign key';

COMMENT ON COLUMN upchieve.direct_message_conversations.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.direct_message_conversations.updated_at IS 'not_pii';

-- migrate:down
DROP TABLE upchieve.direct_message_conversations;


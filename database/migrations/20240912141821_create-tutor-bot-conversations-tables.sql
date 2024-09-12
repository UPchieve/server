-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.tutor_bot_conversations (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES upchieve.users (id),
    session_id uuid REFERENCES upchieve.sessions (id),
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TYPE upchieve.tutor_bot_conversation_user_type AS ENUM (
    'student',
    'bot',
    'volunteer'
);

CREATE TABLE IF NOT EXISTS upchieve.tutor_bot_conversation_messages (
    tutor_bot_conversation_id uuid NOT NULL REFERENCES upchieve.tutor_bot_conversations (id),
    user_id uuid NOT NULL REFERENCES upchieve.users (id),
    sender_user_type upchieve.tutor_bot_conversation_user_type NOT NULL,
    message text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE upchieve.tutor_bot_conversation_messages
    ADD PRIMARY KEY (tutor_bot_conversation_id, user_id, sender_user_type, created_at);

-- migrate:down
DROP TABLE IF EXISTS upchieve.tutor_bot_conversation_messages;

DROP TABLE IF EXISTS upchieve.tutor_bot_conversations;

DROP TYPE IF EXISTS upchieve.tutor_bot_conversation_user_type;


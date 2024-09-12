-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.tutor_bot_conversations (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES upchieve.users (id),
    session_id uuid DEFAULT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TYPE upchieve.tutor_bot_conversation_user_type AS ENUM (
    'student',
    'bot',
    'volunteer'
);

CREATE TABLE IF NOT EXISTS upchieve.tutor_bot_conversation_messages (
    id uuid PRIMARY KEY,
    tutor_bot_conversation_id uuid NOT NULL REFERENCES upchieve.tutor_bot_conversations (id),
    sender_id uuid NOT NULL REFERENCES upchieve.users (id),
    sender_user_type tutor_bot_conversation_user_type NOT NULL,
    message text NOT NULL,
    created_at timestampz DEFAULT now() NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.tutor_bot_conversations;

DROP TYPE IF EXISTS upchieve.tutor_bot_conversation_user_type;

DROP TABLE IF EXISTS upchieve.tutor_bot_conversation_messages;


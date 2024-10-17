-- migrate:up
CREATE UNIQUE INDEX IF NOT EXISTS tutor_bot_conversations_unique_non_null_session_id ON upchieve.tutor_bot_conversations (session_id)
WHERE
    session_id IS NOT NULL;

-- migrate:down
DROP INDEX IF EXISTS tutor_bot_conversations_unique_non_null_session_id;


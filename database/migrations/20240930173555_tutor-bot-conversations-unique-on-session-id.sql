-- migrate:up
ALTER TABLE IF EXISTS upchieve.tutor_bot_conversations
    ADD CONSTRAINT session_id_unique UNIQUE (session_id);

-- migrate:down
ALTER TABLE IF EXISTS upchieve.tutor_bot_conversations
    DROP CONSTRAINT IF EXISTS session_id_unique;


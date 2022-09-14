-- migrate:up
CREATE INDEX IF NOT EXISTS session_messages_session_id ON upchieve.session_messages (session_id);

-- migrate:down
DROP INDEX IF EXISTS upchieve.session_messages_session_id;


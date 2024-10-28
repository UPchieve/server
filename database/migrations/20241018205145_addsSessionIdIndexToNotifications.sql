-- migrate:up
CREATE INDEX IF NOT EXISTS notifications_session_id ON upchieve.notifications (session_id uuid_ops);

-- migrate:down
DROP INDEX IF EXISTS upchieve.notifications_session_id;


-- migrate:up
CREATE INDEX IF NOT EXISTS notifications_user_id ON upchieve.notifications (user_id);

-- migrate:down
DROP INDEX IF EXISTS upchieve.notifications_user_id;


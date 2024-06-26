-- migrate:up
CREATE INDEX IF NOT EXISTS notifications_sent_at_idx ON upchieve.notifications (sent_at);

-- migrate:down
DROP INDEX IF EXISTS upchieve.notifications_sent_at_idx;


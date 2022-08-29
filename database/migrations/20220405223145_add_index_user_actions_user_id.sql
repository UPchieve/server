-- migrate:up
CREATE INDEX IF NOT EXISTS user_actions_user_id ON upchieve.user_actions (user_id);

-- migrate:down
DROP INDEX IF EXISTS upchieve.user_actions_user_id;


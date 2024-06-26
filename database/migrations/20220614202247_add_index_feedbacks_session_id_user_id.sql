-- migrate:up
CREATE UNIQUE INDEX IF NOT EXISTS feedbacks_session_id_user_id ON upchieve.feedbacks (session_id, user_id);

-- migrate:down
DROP INDEX IF EXISTS upchieve.feedbacks_session_id_user_id;


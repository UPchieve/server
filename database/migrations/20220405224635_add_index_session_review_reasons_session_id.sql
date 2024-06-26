-- migrate:up
CREATE INDEX IF NOT EXISTS session_review_reasons_session_id ON upchieve.session_review_reasons (session_id);

-- migrate:down
DROP INDEX IF EXISTS upchieve.session_review_reasons_session_id;


-- migrate:up
CREATE INDEX IF NOT EXISTS session_reports_session_id ON upchieve.session_reports (session_id);

-- migrate:down
DROP INDEX IF EXISTS upchieve.session_reports_session_id;


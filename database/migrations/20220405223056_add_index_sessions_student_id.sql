-- migrate:up
CREATE INDEX IF NOT EXISTS sessions_student_id ON upchieve.sessions (student_id);

-- migrate:down
DROP INDEX IF EXISTS upchieve.sessions_student_id;


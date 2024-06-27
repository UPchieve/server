-- migrate:up
CREATE INDEX IF NOT EXISTS sessions_volunteer_id ON upchieve.sessions (volunteer_id);

-- migrate:down
DROP INDEX IF EXISTS upchieve.sessions_volunteer_id;


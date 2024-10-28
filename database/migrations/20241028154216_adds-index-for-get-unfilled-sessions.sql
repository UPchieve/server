-- migrate:up
CREATE INDEX IF NOT EXISTS sessions_idx_volunteer_ended_at_created_at ON upchieve.sessions (volunteer_id, ended_at, created_at);

-- migrate:down
DROP INDEX IF EXISTS upchieve.sessions_idx_volunteer_ended_at_created_at;


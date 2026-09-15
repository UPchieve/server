-- migrate:up transaction:false
CREATE INDEX sessions_active_volunteer_idx ON upchieve.sessions (volunteer_id)
WHERE
    ended_at IS NULL;

-- migrate:down transaction:false
DROP INDEX upchieve.sessions_active_volunteer_idx;


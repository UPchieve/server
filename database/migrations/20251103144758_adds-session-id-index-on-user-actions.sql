-- migrate:up
CREATE INDEX partial_session_id_idx ON upchieve.user_actions (session_id uuid_ops)
WHERE
    session_id IS NOT NULL;

-- migrate:down
DROP INDEX upchieve.partial_session_id_idx;


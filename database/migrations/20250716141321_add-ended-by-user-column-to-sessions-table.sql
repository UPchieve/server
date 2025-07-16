-- migrate:up
ALTER TABLE upchieve.sessions
    ADD COLUMN ended_by_user_id UUID REFERENCES upchieve.users (id) DEFAULT NULL;

-- migrate:down
ALTER TABLE upchieve.sessions
    DROP COLUMN ended_by_user_id;


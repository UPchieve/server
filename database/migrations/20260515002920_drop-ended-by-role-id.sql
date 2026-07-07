-- migrate:up
ALTER TABLE upchieve.sessions
    DROP COLUMN ended_by_role_id;

-- migrate:down
ALTER TABLE upchieve.sessions
    ADD COLUMN ended_by_role_id integer REFERENCES upchieve.user_roles (id);


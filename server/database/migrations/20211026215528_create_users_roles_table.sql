-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.users_roles (
    user_id uuid NOT NULL,
    role_id int NOT NULL,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL,
    PRIMARY KEY (user_id, role_id))
-- migrate:down
DROP TABLE IF EXISTS upchieve.users_roles CASCADE;


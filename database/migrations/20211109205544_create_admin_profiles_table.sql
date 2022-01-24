-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.admin_profiles (
    user_id uuid PRIMARY KEY REFERENCES upchieve.users (id),
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.admin_profiles CASCADE;


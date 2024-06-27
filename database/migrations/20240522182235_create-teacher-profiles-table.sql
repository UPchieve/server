-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.teacher_profiles (
    user_id uuid PRIMARY KEY REFERENCES upchieve.users (id),
    school_id uuid REFERENCES upchieve.schools (id),
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.teacher_profiles;


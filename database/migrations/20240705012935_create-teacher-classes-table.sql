-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.teacher_classes (
    id uuid PRIMARY KEY,
    user_id uuid REFERENCES upchieve.teacher_profiles (user_id),
    name text NOT NULL,
    code text NOT NULL UNIQUE,
    active boolean NOT NULL DEFAULT TRUE,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.teacher_classes;


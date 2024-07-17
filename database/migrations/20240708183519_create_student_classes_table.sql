-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.student_classes (
    user_id uuid REFERENCES upchieve.student_profiles (user_id),
    class_id uuid REFERENCES upchieve.teacher_classes (id),
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, class_id)
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.student_classes;


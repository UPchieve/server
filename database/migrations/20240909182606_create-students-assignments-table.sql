-- migrate:up
CREATE TABLE upchieve.students_assignments (
    user_id uuid REFERENCES upchieve.student_profiles (user_id),
    assignment_id uuid REFERENCES upchieve.assignments (id),
    submitted_at timestamptz,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL,
    PRIMARY KEY (user_id, assignment_id)
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.students_assignments;


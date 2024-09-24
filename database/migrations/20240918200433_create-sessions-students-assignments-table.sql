-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.sessions_students_assignments (
    session_id uuid NOT NULL,
    user_id uuid NOT NULL,
    assignment_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    FOREIGN KEY (user_id, assignment_id) REFERENCES upchieve.students_assignments (user_id, assignment_id),
    PRIMARY KEY (session_id, user_id, assignment_id)
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.sessions_students_assignments;


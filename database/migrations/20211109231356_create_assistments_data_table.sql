-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.assistments_data (
    id uuid PRIMARY KEY,
    problem_id int NOT NULL,
    assignment_id uuid NOT NULL,
    student_id uuid NOT NULL,
    session_id uuid NOT NULL,
    sent boolean,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.assistments_data CASCADE;


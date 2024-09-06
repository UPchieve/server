-- migrate:up
CREATE TABLE upchieve.assignments (
    id uuid PRIMARY KEY,
    class_id uuid NOT NULL REFERENCES upchieve.teacher_classes (id),
    description text,
    title text,
    number_of_sessions int,
    min_duration_in_minutes int,
    due_date timestamptz,
    start_date timestamptz,
    is_required boolean NOT NULL DEFAULT FALSE,
    subject_id int REFERENCES upchieve.subjects (id),
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.assignments;


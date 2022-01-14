-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.feedbacks (
    id uuid PRIMARY KEY,
    topic_id int REFERENCES upchieve.topics (id),
    subject_id int REFERENCES upchieve.subjects (id),
    user_role_id int REFERENCES upchieve.user_roles (id),
    session_id uuid REFERENCES upchieve.sessions (id),
    student_tutoring_feedback json,
    student_counseling_feedback json,
    volunteer_feedback json,
    comment text,
    user_id uuid REFERENCES upchieve.users (id),
    legacy_feedbacks json,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.feedbacks CASCADE;


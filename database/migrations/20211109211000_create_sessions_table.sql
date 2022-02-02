-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.sessions (
    id uuid PRIMARY KEY,
    student_id uuid REFERENCES upchieve.users (id),
    volunteer_id uuid REFERENCES upchieve.users (id),
    subject_id int NOT NULL REFERENCES upchieve.subjects (id),
    has_whiteboard_doc boolean NOT NULL DEFAULT FALSE,
    quill_doc text,
    volunteer_joined_at timestamp,
    ended_at timestamp,
    ended_by_role_id int REFERENCES upchieve.user_roles (id),
    reviewed boolean,
    to_review boolean,
    student_banned boolean,
    time_tutored bigint,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.sessions CASCADE;


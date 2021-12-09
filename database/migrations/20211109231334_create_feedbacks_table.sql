-- migrate:up
create table if not exists upchieve.feedbacks (
    id uuid primary key,
    topic_id int references upchieve.topics (id),
    subject_id int references upchieve.subjects (id),
    user_role_id int references upchieve.user_roles (id),
    session_id uuid references upchieve.sessions (id),
    student_tutoring_feedback json,
    student_counseling_feedback json,
    volunteer_feedback json,
    comment text,
    user_id uuid references upchieve.users (id),
    legacy_feedbacks json,
    created_at timestamp not null,
    updated_at timestamp not null
);

-- migrate:down
drop table if exists upchieve.feedbacks cascade;


-- migrate:up
create table if not exists upchieve.sessions (
    id uuid primary key,
    student_id uuid references upchieve.users (id),
    volunteer_id uuid references upchieve.users (id),
    subject_id int not null references upchieve.subjects (id),
    has_whiteboard_doc boolean not null default false,
    quill_doc text,
    volunteer_joined_at timestamp,
    ended_at timestamp,
    ended_by_role_id int references upchieve.user_roles (id),
    reviewed boolean,
    to_review boolean,
    student_banned boolean,
    time_tutored bigint,
    created_at timestamp not null,
    updated_at timestamp not null
);

-- migrate:down
drop table if exists upchieve.sessions cascade;


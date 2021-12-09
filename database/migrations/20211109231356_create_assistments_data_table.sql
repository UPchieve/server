-- migrate:up
create table if not exists upchieve.assistments_data (
    id uuid primary key,
    problem_id int not null,
    assignment_id uuid not null,
    student_id uuid not null,
    session_id uuid not null,
    sent boolean,
    created_at timestamp not null,
    updated_at timestamp not null
);

-- migrate:down
drop table if exists upchieve.assistments_data cascade;


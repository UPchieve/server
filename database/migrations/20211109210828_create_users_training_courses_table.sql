-- migrate:up
create table if not exists upchieve.users_training_courses (
    user_id uuid not null references upchieve.users (id),
    training_course_id int not null references upchieve.training_courses (id),
    complete boolean not null default false,
    progress smallint not null default 0 check (progress >= 0) check (progress <= 100),
    completed_materials text[],
    created_at timestamp not null,
    updated_at timestamp not null,
    primary key (user_id, training_course_id)
);

-- migrate:down
drop table if exists upchieve.users_training_courses cascade;


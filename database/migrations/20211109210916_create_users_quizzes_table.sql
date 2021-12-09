-- migrate:up
create table if not exists upchieve.users_quizzes (
    user_id uuid not null references upchieve.users (id),
    quiz_id int not null references upchieve.quizzes (id),
    attempts int not null default 0,
    passed boolean not null default false,
    created_at timestamp not null,
    updated_at timestamp not null,
    primary key (user_id, quiz_id)
);

-- migrate:down
drop table if exists upchieve.users_quizzes cascade;


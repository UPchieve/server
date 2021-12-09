-- migrate:up
create table if not exists upchieve.quiz_subcategories (
    id serial primary key,
    name text not null,
    quiz_id int not null references upchieve.quizzes (id),
    created_at timestamp not null,
    updated_at timestamp not null
);

-- migrate:down
drop table if exists upchieve.quiz_subcategories cascade;


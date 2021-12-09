-- migrate:up
create table if not exists upchieve.training_courses (
    id serial primary key,
    name text not null unique,
    created_at timestamp not null,
    updated_at timestamp not null
);

-- migrate:down
drop table if exists upchieve.training_courses cascade;


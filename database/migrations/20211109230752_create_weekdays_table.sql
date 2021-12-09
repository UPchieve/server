-- migrate:up
create table if not exists upchieve.weekdays (
    id serial primary key,
    day text not null unique,
    created_at timestamp not null,
    updated_at timestamp not null
);

-- migrate:down
drop table if exists upchieve.weekdays cascade;


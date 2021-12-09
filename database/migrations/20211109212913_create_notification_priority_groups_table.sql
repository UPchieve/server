-- migrate:up
create table if not exists upchieve.notification_priority_groups (
    id serial primary key,
    name text not null unique,
    priority smallint not null,
    created_at timestamp not null,
    updated_at timestamp not null
);

-- migrate:down
drop table if exists upchieve.notification_priority_groups cascade;


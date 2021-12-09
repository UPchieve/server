-- migrate:up
create table if not exists upchieve.notification_methods (
    id serial primary key,
    method text not null unique,
    created_at timestamp not null,
    updated_at timestamp not null
);

-- migrate:down
drop table if exists upchieve.notification_methods cascade;


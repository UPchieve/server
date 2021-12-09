-- migrate:up
create table if not exists upchieve.topics (
    id serial primary key,
    name text not null unique,
    icon_link text,
    color text,
    dashboard_order smallint not null unique,
    display_name text not null,
    created_at timestamp not null,
    updated_at timestamp not null
);

-- migrate:down
drop table if exists upchieve.topics cascade;


-- migrate:up
create table if not exists upchieve.tool_types (
    id serial primary key,
    name text not null unique,
    created_at timestamp not null,
    updated_at timestamp not null
);

-- migrate:down
drop table if exists upchieve.tool_types cascade;


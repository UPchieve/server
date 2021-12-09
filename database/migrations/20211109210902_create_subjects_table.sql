-- migrate:up
create table if not exists upchieve.subjects (
    id serial primary key,
    name text not null unique,
    display_name text not null unique,
    display_order int not null,
    topic_id int not null references upchieve.topics (id),
    tool_type_id int not null references upchieve.tool_types (id),
    created_at timestamp not null,
    updated_at timestamp not null
);

-- migrate:down
drop table if exists upchieve.subjects cascade;


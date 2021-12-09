-- migrate:up
create table if not exists upchieve.us_states (
    code varchar(2) primary key not null unique,
    name text not null unique,
    created_at timestamp not null,
    updated_at timestamp not null
);

-- migrate:down
drop table if exists upchieve.us_states cascade;


-- migrate:up
create table if not exists upchieve.cities (
    id serial primary key,
    name text not null unique,
    us_state_code varchar(2) references upchieve.us_states (code),
    created_at timestamp not null,
    updated_at timestamp not null
);

-- migrate:down
drop table if exists upchieve.cities cascade;


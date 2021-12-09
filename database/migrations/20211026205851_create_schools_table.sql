-- migrate:up
create table if not exists upchieve.schools (
    id uuid primary key,
    name text not null,
    approved boolean not null default false,
    partner boolean not null default false,
    city_id int references upchieve.cities (id),
    us_state_code varchar(2) references upchieve.us_states (code),
    created_at timestamp not null,
    updated_at timestamp not null,
    name_search tsvector generated always as (to_tsvector('english', name)) stored
);

create index if not exists name_search_idx on upchieve.schools using gin (name_search);

-- migrate:down
drop index if exists upchieve.name_search_idx;

drop table if exists upchieve.schools cascade;


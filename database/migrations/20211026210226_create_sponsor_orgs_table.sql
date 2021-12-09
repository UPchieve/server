-- migrate:up
create table if not exists upchieve.sponsor_orgs (
    id uuid primary key,
    name text not null,
    created_at timestamp not null,
    updated_at timestamp not null
);

-- migrate:down
drop table if exists upchieve.sponsor_orgs;


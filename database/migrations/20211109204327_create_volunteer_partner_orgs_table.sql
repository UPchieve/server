-- migrate:up
create table if not exists upchieve.volunteer_partner_orgs (
    id uuid primary key,
    key text not null unique,
    name text not null unique,
    receive_weekly_hour_summary_email boolean not null default false,
    created_at timestamp not null,
    updated_at timestamp not null
);

-- migrate:down
drop table if exists upchieve.volunteer_partner_orgs cascade;


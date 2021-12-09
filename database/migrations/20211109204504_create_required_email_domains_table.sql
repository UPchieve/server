-- migrate:up
create table if not exists upchieve.required_email_domains (
    id uuid primary key,
    domain text not null unique,
    volunteer_partner_org_id uuid not null references upchieve.volunteer_partner_orgs (id),
    created_at timestamp not null,
    updated_at timestamp not null
);

-- migrate:down
drop table if exists upchieve.required_email_domains cascade;


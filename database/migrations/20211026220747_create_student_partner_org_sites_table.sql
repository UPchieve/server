-- migrate:up
create table if not exists upchieve.student_partner_org_sites (
    id uuid primary key,
    name text not null unique,
    student_partner_org_id uuid not null references upchieve.student_partner_orgs (id),
    created_at timestamp not null,
    updated_at timestamp not null
);

-- migrate:down
drop table if exists upchieve.student_partner_org_sites cascade;


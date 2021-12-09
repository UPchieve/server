-- migrate:up
create table upchieve.schools_sponsor_orgs (
    school_id uuid not null references upchieve.schools (id),
    sponsor_org_id uuid not null references upchieve.sponsor_orgs (id),
    created_at timestamp not null,
    updated_at timestamp not null,
    primary key (school_id, sponsor_org_id)
);

-- migrate:down
drop table if exists upchieve.schools_sponsor_orgs cascade;


-- migrate:up
create table upchieve.student_partner_orgs_sponsor_orgs (
    student_partner_org_id uuid not null references upchieve.student_partner_orgs (id),
    sponsor_org_id uuid not null references upchieve.sponsor_orgs (id),
    created_at timestamp not null,
    updated_at timestamp not null,
    primary key (student_partner_org_id, sponsor_org_id)
);

-- migrate:down
drop table if exists upchieve.student_partner_orgs_sponsor_orgs cascade;


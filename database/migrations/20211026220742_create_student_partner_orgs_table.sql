-- migrate:up
create table if not exists upchieve.student_partner_orgs (
    id uuid primary key,
    key text not null unique,
    name text not null unique,
    signup_code text unique,
    high_school_signup boolean not null default false,
    college_signup boolean not null default false,
    school_signup_required boolean not null default false,
    created_at timestamp not null,
    updated_at timestamp not null
);

-- migrate:down
drop table if exists upchieve.student_partner_orgs cascade;


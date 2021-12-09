-- migrate:up
create table if not exists upchieve.student_profiles (
    user_id uuid primary key references upchieve.users (id),
    college text,
    school_id uuid references upchieve.schools (id),
    postal_code varchar(2) references upchieve.postal_codes (code),
    grade_level_id int references upchieve.grade_levels (id),
    student_partner_org_user_id uuid,
    student_partner_org_id uuid references upchieve.student_partner_orgs (id),
    student_partner_org_site_id uuid references upchieve.student_partner_org_sites (id),
    created_at timestamp not null,
    updated_at timestamp not null
);

-- migrate:down
drop table if exists upchieve.student_profiles cascade;


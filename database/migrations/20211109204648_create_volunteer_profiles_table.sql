-- migrate:up
create table if not exists upchieve.volunteer_profiles (
    user_id uuid primary key references upchieve.users (id),
    volunteer_partner_org_id uuid references upchieve.volunteer_partner_orgs (id),
    timezone text not null,
    approved boolean not null default false,
    onboarded boolean not null default false,
    photo_id_s3_key text,
    photo_id_status int references upchieve.photo_id_statuses (id),
    linkedin_url text,
    college text,
    company text,
    languages text[],
    experience json,
    city text,
    state text,
    country text,
    created_at timestamp not null,
    updated_at timestamp not null
);

-- migrate:down
drop table if exists upchieve.volunteer_profiles cascade;


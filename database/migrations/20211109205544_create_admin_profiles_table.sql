-- migrate:up
create table if not exists upchieve.admin_profiles (
    user_id uuid primary key references upchieve.users (id),
    created_at timestamp not null,
    updated_at timestamp not null
);

-- migrate:down
drop table if exists upchieve.admin_profiles cascade;


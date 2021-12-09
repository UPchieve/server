-- migrate:up
create table if not exists upchieve.users_roles (
    user_id uuid not null,
    role_id int not null,
    created_at timestamp not null,
    updated_at timestamp not null,
    primary key (user_id, role_id))
-- migrate:down
drop table if exists upchieve.users_roles cascade;


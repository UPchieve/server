-- migrate:up
create table if not exists upchieve.users_ip_addresses (
    id uuid primary key,
    ip_address_id int not null references upchieve.ip_addresses (id),
    user_id uuid not null references upchieve.users (id),
    created_at timestamp not null,
    updated_at timestamp not null
);

-- migrate:down
drop table if exists upchieve.users_ip_addresses cascade;


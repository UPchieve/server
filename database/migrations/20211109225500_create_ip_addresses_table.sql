-- migrate:up
create table if not exists upchieve.ip_addresses (
    id bigserial primary key,
    ip inet not null unique,
    status text,
    created_at timestamp not null,
    updated_at timestamp not null
);

-- migrate:down
drop table if exists upchieve.ip_addresses cascade;


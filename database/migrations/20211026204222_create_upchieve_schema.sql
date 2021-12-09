-- migrate:up
create schema if not exists upchieve;

-- migrate:down
drop schema if exists upchieve;


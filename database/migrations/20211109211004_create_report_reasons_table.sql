-- migrate:up
create table if not exists upchieve.report_reasons (
    id serial primary key,
    reason text not null unique,
    created_at timestamp not null,
    updated_at timestamp not null
);

-- migrate:down
drop table if exists upchieve.report_reasons cascade;


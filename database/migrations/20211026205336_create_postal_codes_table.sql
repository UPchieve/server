-- migrate:up
create table if not exists upchieve.postal_codes (
    code text primary key not null unique,
    us_state_code varchar(2) references upchieve.us_states (code),
    income int,
    location point,
    created_at timestamp not null,
    updated_at timestamp not null
);

-- migrate:down
drop table if exists upchieve.postal_codes cascade;


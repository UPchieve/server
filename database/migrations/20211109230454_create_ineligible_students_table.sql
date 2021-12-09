-- migrate:up
create table if not exists upchieve.ineligible_students (
    id uuid primary key,
    email text not null unique,
    postal_code varchar(2) references upchieve.postal_codes (code),
    ip_address_id bigint references upchieve.ip_addresses (id),
    school_id uuid references upchieve.schools (id),
    grade_level_id int references upchieve.grade_levels (id),
    created_at timestamp not null,
    updated_at timestamp not null
);

-- migrate:down
drop table if exists upchieve.ineligible_students cascade;


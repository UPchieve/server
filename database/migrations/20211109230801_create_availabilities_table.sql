-- migrate:up
create table if not exists upchieve.availabilities (
    id uuid primary key,
    user_id uuid not null references upchieve.users (id),
    weekday_id int not null references upchieve.weekdays (id),
    available_start smallint,
    available_end smallint,
    timezone text,
    created_at timestamp not null,
    updated_at timestamp not null
);

-- migrate:down
drop table if exists upchieve.availabilities cascade;


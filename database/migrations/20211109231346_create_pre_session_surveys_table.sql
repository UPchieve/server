-- migrate:up
create table if not exists upchieve.pre_session_surveys (
    id uuid primary key,
    response_data json,
    session_id uuid not null unique references upchieve.sessions (id),
    user_id uuid references upchieve.users (id),
    created_at timestamp not null,
    updated_at timestamp not null
);

-- migrate:down
drop table if exists upchieve.pre_session_surveys cascade;


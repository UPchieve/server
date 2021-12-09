-- migrate:up
create table if not exists upchieve.session_messages (
    id uuid primary key,
    sender_id uuid references upchieve.users (id),
    contents text,
    session_id uuid not null references upchieve.sessions (id),
    created_at timestamp not null,
    updated_at timestamp not null
);

-- migrate:down
drop table if exists upchieve.session_messages cascade;


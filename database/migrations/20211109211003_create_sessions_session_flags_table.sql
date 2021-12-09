-- migrate:up
create table if not exists upchieve.sessions_session_flags (
    session_id uuid not null references upchieve.sessions (id),
    session_flag_id int not null references upchieve.session_flags (id),
    created_at timestamp not null,
    updated_at timestamp not null,
    primary key (session_id, session_flag_id)
);

-- migrate:down
drop table if exists upchieve.sessions_session_flags cascade;


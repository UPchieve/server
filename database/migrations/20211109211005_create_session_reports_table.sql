-- migrate:up
create table if not exists upchieve.session_reports (
    id uuid primary key,
    report_reason_id int not null references upchieve.report_reasons (id),
    report_message text,
    reporting_user_id uuid not null references upchieve.users (id),
    session_id uuid not null references upchieve.sessions (id),
    reported_user_id uuid not null references upchieve.users (id),
    created_at timestamp not null,
    updated_at timestamp not null
);

-- migrate:down
drop table if exists upchieve.session_reports cascade;


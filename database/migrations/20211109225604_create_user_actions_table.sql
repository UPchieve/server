-- migrate:up
create table if not exists upchieve.user_actions (
    id bigserial primary key,
    user_id uuid references upchieve.users (id),
    session_id uuid references upchieve.sessions (id),
    action_type text,
    action text,
    ip_address_id bigint references upchieve.ip_addresses (id),
    device text,
    browser text,
    browser_version text,
    operating_system text,
    operating_system_version text,
    quiz_subcategory text,
    quiz_category text,
    created_at timestamp not null,
    updated_at timestamp not null
);

-- migrate:down
drop table if exists upchieve.user_actions cascade;


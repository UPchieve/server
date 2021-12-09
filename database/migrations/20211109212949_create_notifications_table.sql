-- migrate:up
create table if not exists upchieve.notifications (
    id uuid primary key,
    user_id uuid not null references upchieve.users (id),
    sent_at timestamp,
    type_id int not null references upchieve.notification_types (id),
    method_id int not null references upchieve.notification_methods (id),
    priority_group_id int not null references upchieve.notification_priority_groups (id),
    successful boolean,
    session_id uuid references upchieve.sessions (id),
    message_carrier_id text,
    created_at timestamp not null,
    updated_at timestamp not null
);

-- migrate:down
drop table if exists upchieve.notifications cascade;


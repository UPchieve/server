-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.notifications (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES upchieve.users (id),
    sent_at timestamp,
    type_id int NOT NULL REFERENCES upchieve.notification_types (id),
    method_id int NOT NULL REFERENCES upchieve.notification_methods (id),
    priority_group_id int NOT NULL REFERENCES upchieve.notification_priority_groups (id),
    successful boolean,
    session_id uuid REFERENCES upchieve.sessions (id),
    message_carrier_id text,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.notifications CASCADE;


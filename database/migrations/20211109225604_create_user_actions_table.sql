-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.user_actions (
    id bigserial PRIMARY KEY,
    user_id uuid REFERENCES upchieve.users (id),
    session_id uuid REFERENCES upchieve.sessions (id),
    action_type text,
    action text,
    ip_address_id bigint REFERENCES upchieve.ip_addresses (id),
    device text,
    browser text,
    browser_version text,
    operating_system text,
    operating_system_version text,
    quiz_subcategory text,
    quiz_category text,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.user_actions CASCADE;


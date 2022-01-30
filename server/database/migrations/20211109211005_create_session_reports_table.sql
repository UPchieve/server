-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.session_reports (
    id uuid PRIMARY KEY,
    report_reason_id int NOT NULL REFERENCES upchieve.report_reasons (id),
    report_message text,
    reporting_user_id uuid NOT NULL REFERENCES upchieve.users (id),
    session_id uuid NOT NULL REFERENCES upchieve.sessions (id),
    reported_user_id uuid NOT NULL REFERENCES upchieve.users (id),
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.session_reports CASCADE;


-- migrate:up
CREATE TABLE upchieve.direct_message_reports (
    id uuid PRIMARY KEY,
    conversation_id uuid NOT NULL REFERENCES upchieve.direct_message_conversations (id),
    report_reason_id int NOT NULL REFERENCES upchieve.report_reasons (id),
    report_message text,
    reporting_user_id uuid NOT NULL REFERENCES upchieve.users (id),
    reported_user_id uuid NOT NULL REFERENCES upchieve.users (id),
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX direct_message_reports_conversation_id ON upchieve.direct_message_reports (conversation_id);

COMMENT ON TABLE upchieve.direct_message_reports IS 'Participant reports about DM conversations';

COMMENT ON COLUMN upchieve.direct_message_reports.id IS 'not_pii: Primary key';

COMMENT ON COLUMN upchieve.direct_message_reports.conversation_id IS 'not_pii: Foreign key';

COMMENT ON COLUMN upchieve.direct_message_reports.report_reason_id IS 'not_pii: Shared report reason';

COMMENT ON COLUMN upchieve.direct_message_reports.report_message IS 'not_pii: Optional report explanation';

COMMENT ON COLUMN upchieve.direct_message_reports.reporting_user_id IS 'not_pii: Reporting user foreign key';

COMMENT ON COLUMN upchieve.direct_message_reports.reported_user_id IS 'not_pii: Reported user foreign key';

COMMENT ON COLUMN upchieve.direct_message_reports.created_at IS 'not_pii';

COMMENT ON COLUMN upchieve.direct_message_reports.updated_at IS 'not_pii';

-- migrate:down
DROP TABLE upchieve.direct_message_reports;


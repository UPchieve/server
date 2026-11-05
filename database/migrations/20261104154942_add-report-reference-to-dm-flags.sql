-- migrate:up
ALTER TABLE upchieve.direct_message_flags
    ADD COLUMN report_id uuid REFERENCES upchieve.direct_message_reports (id);

COMMENT ON COLUMN upchieve.direct_message_flags.report_id IS 'not_pii: Participant report associated with this review finding';

-- migrate:down
ALTER TABLE upchieve.direct_message_flags
    DROP COLUMN report_id;


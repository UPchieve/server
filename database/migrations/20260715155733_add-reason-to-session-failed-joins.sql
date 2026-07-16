-- migrate:up
ALTER TABLE upchieve.session_failed_joins
    ADD COLUMN reason TEXT NOT NULL DEFAULT 'Unknown';

COMMENT ON COLUMN upchieve.session_failed_joins.reason IS 'not_pii';

-- migrate:down
ALTER TABLE upchieve.session_failed_joins
    DROP COLUMN reason;


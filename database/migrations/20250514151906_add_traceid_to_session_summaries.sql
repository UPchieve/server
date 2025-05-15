-- migrate:up
ALTER TABLE upchieve.session_summaries
    ADD COLUMN trace_id VARCHAR(255);

-- migrate:down
ALTER TABLE upchieve.session_summaries
    DROP COLUMN trace_id;


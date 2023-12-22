-- migrate:up
ALTER TABLE upchieve.progress_reports
    ADD COLUMN IF NOT EXISTS read_at timestamptz;

-- migrate:down
ALTER TABLE upchieve.progress_reports
    DROP COLUMN IF EXISTS read_at;


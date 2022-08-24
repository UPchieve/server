-- migrate:up
ALTER TABLE upchieve.assistments_data
    ADD COLUMN sent_at TIMESTAMP,
    ALTER COLUMN sent SET DEFAULT FALSE;

-- migrate:down
ALTER TABLE upchieve.assistments_data
    DROP COLUMN sent_at,
    ALTER COLUMN sent DROP DEFAULT;


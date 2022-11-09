-- migrate:up
ALTER TABLE upchieve.subjects
    ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT TRUE;

-- migrate:down
ALTER TABLE upchieve.subjects
    DROP COLUMN IF EXISTS active;


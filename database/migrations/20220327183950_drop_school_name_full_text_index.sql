-- migrate:up
DROP INDEX IF EXISTS upchieve.name_search_idx;

ALTER TABLE upchieve.schools
    DROP COLUMN IF EXISTS name_search;

-- migrate:down
ALTER TABLE upchieve.schools
    ADD COLUMN IF NOT EXISTS name_search tsvector GENERATED always AS (to_tsvector('english', name)) stored;

CREATE INDEX IF NOT EXISTS name_search_idx ON upchieve.schools USING gin (name_search);


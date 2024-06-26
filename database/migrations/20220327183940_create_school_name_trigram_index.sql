-- migrate:up
CREATE INDEX IF NOT EXISTS school_name_search ON upchieve.schools USING GIN (name gin_trgm_ops);

-- migrate:down
DROP INDEX IF EXISTS upchieve.school_name_search;


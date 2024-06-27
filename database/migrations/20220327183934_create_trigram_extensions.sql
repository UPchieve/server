-- migrate:up
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE EXTENSION IF NOT EXISTS btree_gin;

-- migrate:down

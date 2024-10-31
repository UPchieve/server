-- migrate:up
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- migrate:down
DROP EXTENSION IF EXISTS pg_stat_statements;


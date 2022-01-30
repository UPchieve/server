-- migrate:up
CREATE SCHEMA IF NOT EXISTS upchieve;

-- migrate:down
DROP SCHEMA IF EXISTS upchieve;


-- migrate:up
ALTER TABLE upchieve.surveys
ADD COLUMN IF NOT EXISTS role_id int4;

-- migrate:down
ALTER TABLE upchieve.surveys
DROP COLUMN IF EXISTS role_id;

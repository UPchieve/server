-- migrate:up
ALTER TABLE upchieve.sponsor_orgs ADD COLUMN IF NOT EXISTS key TEXT;

-- migrate:down
ALTER TABLE upchieve.sponsor_orgs DROP COLUMN IF EXISTS key;

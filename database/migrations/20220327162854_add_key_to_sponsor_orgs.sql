-- migrate:up
ALTER TABLE upchieve.sponsor_orgs ADD COLUMN IF NOT EXISTS key TEXT NOT NULL;

-- migrate:down
ALTER TABLE upchieve.sponsor_orgs DROP COLUMN IF EXISTS key;

-- migrate:up
ALTER TABLE upchieve.postal_codes
    ADD COLUMN IF NOT EXISTS qualifying_income INT;

-- migrate:down
ALTER TABLE upchieve.postal_codes
    DROP COLUMN IF EXISTS qualifying_income;


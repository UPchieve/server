-- migrate:up
ALTER TABLE upchieve.postal_codes
    ADD COLUMN IF NOT EXISTS cbsa_income INT,
    ADD COLUMN IF NOT EXISTS state_income INT;

-- migrate:down
ALTER TABLE upchieve.postal_codes
    DROP COLUMN IF EXISTS cbsa_income,
    DROP COLUMN IF EXISTS state_income;


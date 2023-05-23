-- migrate:up
ALTER TABLE upchieve.postal_codes
    ADD COLUMN IF NOT EXISTS qualifying_income INT,
    ADD COLUMN IF NOT EXISTS cbsa_code INT;

-- migrate:down
ALTER TABLE upchieve.postal_codes
    DROP COLUMN IF EXISTS qualifying_income,
    DROP COLUMN IF EXISTS cbsa_code;


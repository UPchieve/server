-- migrate:up
ALTER TABLE upchieve.user_product_flags
    ADD COLUMN IF NOT EXISTS fall_incentive_program boolean NOT NULL DEFAULT FALSE;

-- migrate:down
ALTER TABLE upchieve.user_product_flags
    DROP COLUMN IF EXISTS fall_incentive_program;


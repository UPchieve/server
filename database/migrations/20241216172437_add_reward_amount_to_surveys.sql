-- migrate:up
ALTER TABLE upchieve.surveys
    ADD COLUMN IF NOT EXISTS reward_amount integer;

-- migrate:down
ALTER TABLE upchieve.surveys
    DROP COLUMN IF EXISTS reward_amount;


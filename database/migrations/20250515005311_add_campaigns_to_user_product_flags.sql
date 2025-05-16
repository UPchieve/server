-- migrate:up
ALTER TABLE upchieve.user_product_flags
    ADD COLUMN campaigns JSONB DEFAULT '{}'::jsonb;

-- migrate:down
ALTER TABLE upchieve.user_product_flags
    DROP COLUMN campaigns;


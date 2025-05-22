-- migrate:up
ALTER TABLE upchieve.user_product_flags
    ADD COLUMN impact_study_campaigns JSONB DEFAULT '{}'::jsonb;

-- migrate:down
ALTER TABLE upchieve.user_product_flags
    DROP COLUMN impact_study_campaigns;


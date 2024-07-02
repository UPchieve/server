-- migrate:up
ALTER TABLE upchieve.topics
    ADD COLUMN IF NOT EXISTS training_order smallint NOT NULL DEFAULT 0;

-- migrate:down
ALTER TABLE upchieve.topics
    DROP COLUMN IF EXISTS training_order;


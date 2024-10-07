-- migrate:up
ALTER TABLE upchieve.school_nces_metadata
    ADD COLUMN IF NOT EXISTS title1_school_status text;

-- migrate:down
ALTER TABLE upchieve.school_nces_metadata
    DROP COLUMN IF EXISTS title1_school_status;


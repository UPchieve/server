-- migrate:up
ALTER TABLE upchieve.training_courses
    ADD COLUMN IF NOT EXISTS display_name text;

-- migrate:down
ALTER TABLE upchieve.training_courses
    DROP COLUMN IF EXISTS display_name;


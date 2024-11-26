-- migrate:up
ALTER TABLE IF EXISTS upchieve.teacher_classes
    ADD COLUMN IF NOT EXISTS is_demo boolean;

-- migrate:down
ALTER TABLE IF EXISTS upchieve.teacher_classes
    DROP COLUMN IF EXISTS is_demo;


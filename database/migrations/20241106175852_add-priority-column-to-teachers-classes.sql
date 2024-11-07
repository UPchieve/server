-- migrate:up
ALTER TABLE upchieve.teacher_classes
    ADD COLUMN is_priority BOOLEAN DEFAULT NULL;

-- migrate:down
ALTER TABLE upchieve.teacher_classes
    DROP COLUMN IF EXISTS is_priority;


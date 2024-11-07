-- migrate:up
ALTER TABLE upchieve.teacher_classes
    ADD COLUMN is_priority BOOLEAN;

-- migrate:down
ALTER TABLE upchieve.teacher_classes
    DROP COLUMN IF EXISTS is_priority;


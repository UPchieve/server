-- migrate:up
ALTER TABLE upchieve.teacher_classes
    ADD COLUMN deactivated_on TIMESTAMPTZ;

-- migrate:down
ALTER TABLE upchieve.teacher_classes
    DROP COLUMN deactivated_on;


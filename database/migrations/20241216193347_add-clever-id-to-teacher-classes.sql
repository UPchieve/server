-- migrate:up
ALTER TABLE upchieve.teacher_classes
    ADD COLUMN IF NOT EXISTS clever_id text;

-- migrate:down
ALTER TABLE upchieve.teacher_classes
    DROP COLUMN IF EXISTS clever_id;


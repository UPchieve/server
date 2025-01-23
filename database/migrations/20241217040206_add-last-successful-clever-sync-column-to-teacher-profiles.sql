-- migrate:up
ALTER TABLE upchieve.teacher_profiles
    ADD COLUMN IF NOT EXISTS last_successful_clever_sync timestamptz;

-- migrate:down
ALTER TABLE upchieve.teacher_profiles
    DROP COLUMN IF EXISTS last_successful_clever_sync;


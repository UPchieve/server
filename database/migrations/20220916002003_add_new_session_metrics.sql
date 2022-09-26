-- migrate:up
ALTER TABLE upchieve.user_session_metrics
    ADD COLUMN IF NOT EXISTS personal_identifying_info int NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS graded_assignment int NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS coach_uncomfortable int NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS student_crisis int NOT NULL DEFAULT 0;

-- migrate:down
ALTER TABLE upchieve.user_session_metrics
    DROP COLUMN IF EXISTS personal_identifying_info,
    DROP COLUMN IF EXISTS graded_assignment,
    DROP COLUMN IF EXISTS coach_uncomfortable,
    DROP COLUMN IF EXISTS student_crisis;


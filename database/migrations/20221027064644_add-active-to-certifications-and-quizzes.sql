-- migrate:up
ALTER TABLE upchieve.certifications
    ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT FALSE;

ALTER TABLE upchieve.quizzes
    ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT FALSE;

-- migrate:down
ALTER TABLE upchieve.certifications
    DROP COLUMN IF EXISTS active;

ALTER TABLE upchieve.quizzes
    DROP COLUMN IF EXISTS active;


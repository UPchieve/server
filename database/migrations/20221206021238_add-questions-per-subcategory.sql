-- migrate:up
ALTER TABLE upchieve.quizzes
    ADD COLUMN IF NOT EXISTS questions_per_subcategory smallint NOT NULL DEFAULT 1;

-- migrate:down
ALTER TABLE upchieve.quizzes
    DROP COLUMN IF EXISTS questions_per_subcategory;


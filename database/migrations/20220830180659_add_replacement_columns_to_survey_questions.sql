-- migrate:up
ALTER TABLE upchieve.survey_questions
    ADD COLUMN IF NOT EXISTS replacement_column_1 text,
    ADD COLUMN IF NOT EXISTS replacement_column_2 text;

-- migrate:down
ALTER TABLE upchieve.survey_questions
    DROP COLUMN IF EXISTS replacement_column_1,
    DROP COLUMN IF EXISTS replacement_column_2;


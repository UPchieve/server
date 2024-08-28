-- migrate:up
ALTER TABLE upchieve.survey_questions
    ADD COLUMN response_display_text text
    -- migrate:down
        ALTER TABLE upchieve.survey_questions
        DROP COLUMN response_display_text

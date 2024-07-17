-- migrate:up
ALTER TABLE upchieve.survey_response_choices
    ADD COLUMN display_image text;

-- migrate:down
ALTER TABLE upchieve.survey_response_choices
    DROP COLUMN display_image;


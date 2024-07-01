-- migrate:up
ALTER TABLE upchieve.users_surveys_submissions
    ADD CONSTRAINT users_surveys_submissions_user_survey_id FOREIGN KEY (user_survey_id) REFERENCES upchieve.users_surveys (id) ON DELETE CASCADE;

-- migrate:down
ALTER TABLE upchieve.users_surveys_submissions
    DROP CONSTRAINT IF EXISTS users_surveys_submissions_user_survey_id;


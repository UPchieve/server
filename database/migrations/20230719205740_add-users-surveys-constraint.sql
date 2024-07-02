-- migrate:up
ALTER TABLE upchieve.users_surveys
    ADD CONSTRAINT survey_id_user_id_session_id_survey_type_id UNIQUE (survey_id, user_id, session_id, survey_type_id);

-- migrate:down
ALTER TABLE upchieve.users_surveys
    DROP CONSTRAINT IF EXISTS survey_id_user_id_session_id_survey_type_id;


-- migrate:up
ALTER TABLE upchieve.surveys_context
    ADD CONSTRAINT survey_id_subject_id_survey_type_id UNIQUE NULLS NOT DISTINCT (survey_id, subject_id, survey_type_id);

-- migrate:down
ALTER TABLE upchieve.surveys_context
    DROP CONSTRAINT IF EXISTS survey_id_subject_id_survey_type_id;


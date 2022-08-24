-- migrate:up
ALTER TABLE IF EXISTS upchieve.surveys_survey_questions
    DROP CONSTRAINT IF EXISTS surveys_survey_questions_survey_id_fkey;

ALTER TABLE IF EXISTS upchieve.surveys_survey_questions
    ADD CONSTRAINT surveys_survey_questions_survey_id_fkey FOREIGN KEY (survey_id) REFERENCES upchieve.surveys (id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS upchieve.surveys_survey_questions
    DROP CONSTRAINT IF EXISTS surveys_survey_questions_survey_question_id_fkey;

ALTER TABLE IF EXISTS upchieve.surveys_survey_questions
    ADD CONSTRAINT surveys_survey_questions_survey_question_id_fkey FOREIGN KEY (survey_question_id) REFERENCES upchieve.survey_questions (id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS upchieve.surveys_context
    DROP CONSTRAINT IF EXISTS surveys_context_survey_id_fkey;

ALTER TABLE IF EXISTS upchieve.surveys_context
    ADD CONSTRAINT surveys_context_survey_id_fkey FOREIGN KEY (survey_id) REFERENCES upchieve.surveys (id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS upchieve.surveys_context
    DROP CONSTRAINT IF EXISTS surveys_context_subject_id_fkey;

ALTER TABLE IF EXISTS upchieve.surveys_context
    ADD CONSTRAINT surveys_context_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES upchieve.subjects (id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS upchieve.surveys_context
    DROP CONSTRAINT IF EXISTS surveys_context_survey_type_id_fkey;

ALTER TABLE IF EXISTS upchieve.surveys_context
    ADD CONSTRAINT surveys_context_survey_type_id_fkey FOREIGN KEY (survey_type_id) REFERENCES upchieve.survey_types (id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS upchieve.survey_questions_response_choices
    DROP CONSTRAINT IF EXISTS survey_questions_response_choic_surveys_survey_question_id_fkey;

ALTER TABLE IF EXISTS upchieve.survey_questions_response_choices
    ADD CONSTRAINT survey_questions_response_choic_surveys_survey_question_id_fkey FOREIGN KEY (surveys_survey_question_id) REFERENCES upchieve.surveys_survey_questions (id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS upchieve.survey_questions_response_choices
    DROP CONSTRAINT IF EXISTS survey_questions_response_choices_response_choice_id_fkey;

ALTER TABLE IF EXISTS upchieve.survey_questions_response_choices
    ADD CONSTRAINT survey_questions_response_choices_response_choice_id_fkey FOREIGN KEY (response_choice_id) REFERENCES upchieve.survey_response_choices (id) ON DELETE CASCADE;

-- migrate:down
ALTER TABLE IF EXISTS upchieve.surveys_survey_questions
    DROP CONSTRAINT IF EXISTS surveys_survey_questions_survey_id_fkey;

ALTER TABLE IF EXISTS upchieve.surveys_survey_questions
    ADD CONSTRAINT surveys_survey_questions_survey_id_fkey FOREIGN KEY (survey_id) REFERENCES upchieve.surveys (id);

ALTER TABLE IF EXISTS upchieve.surveys_survey_questions
    DROP CONSTRAINT IF EXISTS surveys_survey_questions_survey_question_id_fkey;

ALTER TABLE IF EXISTS upchieve.surveys_survey_questions
    ADD CONSTRAINT surveys_survey_questions_survey_question_id_fkey FOREIGN KEY (survey_question_id) REFERENCES upchieve.survey_questions (id);

ALTER TABLE IF EXISTS upchieve.surveys_context
    DROP CONSTRAINT IF EXISTS surveys_context_survey_id_fkey;

ALTER TABLE IF EXISTS upchieve.surveys_context
    ADD CONSTRAINT surveys_context_survey_id_fkey FOREIGN KEY (survey_id) REFERENCES upchieve.surveys (id);

ALTER TABLE IF EXISTS upchieve.surveys_context
    DROP CONSTRAINT IF EXISTS surveys_context_subject_id_fkey;

ALTER TABLE IF EXISTS upchieve.surveys_context
    ADD CONSTRAINT surveys_context_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES upchieve.subjects (id);

ALTER TABLE IF EXISTS upchieve.surveys_context
    DROP CONSTRAINT IF EXISTS surveys_context_survey_type_id_fkey;

ALTER TABLE IF EXISTS upchieve.surveys_context
    ADD CONSTRAINT surveys_context_survey_type_id_fkey FOREIGN KEY (survey_type_id) REFERENCES upchieve.survey_types (id);

ALTER TABLE IF EXISTS upchieve.survey_questions_response_choices
    DROP CONSTRAINT IF EXISTS survey_questions_response_choic_surveys_survey_question_id_fkey;

ALTER TABLE IF EXISTS upchieve.survey_questions_response_choices
    ADD CONSTRAINT survey_questions_response_choic_surveys_survey_question_id_fkey FOREIGN KEY (surveys_survey_question_id) REFERENCES upchieve.surveys_survey_questions (id);

ALTER TABLE IF EXISTS upchieve.survey_questions_response_choices
    DROP CONSTRAINT IF EXISTS survey_questions_response_choices_response_choice_id_fkey;

ALTER TABLE IF EXISTS upchieve.survey_questions_response_choices
    ADD CONSTRAINT survey_questions_response_choices_response_choice_id_fkey FOREIGN KEY (response_choice_id) REFERENCES upchieve.survey_response_choices (id);


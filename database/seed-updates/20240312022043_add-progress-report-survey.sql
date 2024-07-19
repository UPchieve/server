-- migrate:up
ALTER TABLE upchieve.users_surveys
    ADD COLUMN IF NOT EXISTS progress_report_id uuid;

INSERT INTO upchieve.surveys (name, role_id, created_at, updated_at)
    VALUES ('Progress Report Rating Survey', 1, NOW(), NOW())
ON CONFLICT ON CONSTRAINT surveys_name_key
    DO NOTHING;

INSERT INTO upchieve.survey_types (name, created_at, updated_at)
    VALUES ('progress-report', NOW(), NOW())
ON CONFLICT ON CONSTRAINT survey_types_name_key
    DO NOTHING;

INSERT INTO upchieve.surveys_context (survey_id, survey_type_id, created_at, updated_at)
SELECT
    upchieve.surveys.id,
    upchieve.survey_types.id,
    NOW(),
    NOW()
FROM
    upchieve.surveys
    JOIN upchieve.survey_types ON TRUE
WHERE (upchieve.surveys.name = 'Progress Report Rating Survey'
    AND upchieve.survey_types.name = 'progress-report');

INSERT INTO upchieve.survey_response_choices (score, choice_text, display_image, created_at, updated_at)
    VALUES (1, 'Like', 'https://cdn.upchieve.org/site-images/thumbs-up.svg', NOW(), NOW()), (0, 'Dislike', 'https://cdn.upchieve.org/site-images/thumbs-down.svg', NOW(), NOW()), (0, 'Score''s too high', NULL, NOW(), NOW()), (0, 'Score''s too low', NULL, NOW(), NOW()), (0, 'My coach was bad', NULL, NOW(), NOW()), (0, 'What you told me to do is not helpful', NULL, NOW(), NOW()), (0, 'These aren''t the concepts I''m studying', NULL, NOW(), NOW());

INSERT INTO upchieve.survey_questions (question_type_id, question_text, created_at, updated_at)
SELECT
    upchieve.question_types.id,
    sub.text,
    NOW(),
    NOW()
FROM
    upchieve.question_types
    JOIN UNNEST(ARRAY['Rate your analysis', 'What was the problem']) AS sub ON TRUE
WHERE
    upchieve.question_types.name = 'multiple choice';

INSERT INTO upchieve.survey_questions (question_type_id, question_text, created_at, updated_at)
SELECT
    upchieve.question_types.id,
    sub.text,
    NOW(),
    NOW()
FROM
    upchieve.question_types
    JOIN UNNEST(ARRAY['Tell us more about the issue or how we can improve']) AS sub ON TRUE
WHERE
    upchieve.question_types.name = 'free response';

INSERT INTO upchieve.surveys_survey_questions (survey_id, survey_question_id, display_priority, created_at, updated_at)
SELECT
    upchieve.surveys.id,
    upchieve.survey_questions.id,
    sub.text::int,
    NOW(),
    NOW()
FROM
    upchieve.surveys
    JOIN upchieve.survey_questions ON TRUE
    JOIN UNNEST(ARRAY[10, 20, 30, 40, 50, 60, 70, 80, 90, 100]) AS sub ON TRUE
WHERE (upchieve.surveys.name = 'Progress Report Rating Survey'
    AND upchieve.survey_questions.question_text = 'Rate your analysis'
    AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'Progress Report Rating Survey'
        AND upchieve.survey_questions.question_text = 'What was the problem'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'Progress Report Rating Survey'
        AND upchieve.survey_questions.question_text = 'Tell us more about the issue or how we can improve'
        AND sub.text::int = 30);

INSERT INTO upchieve.survey_questions_response_choices (surveys_survey_question_id, response_choice_id, display_priority, created_at, updated_at)
SELECT
    ssq.id,
    rc.id,
    sub.text::int,
    NOW(),
    NOW()
FROM
    upchieve.surveys_survey_questions ssq
    JOIN upchieve.survey_response_choices rc ON TRUE
    JOIN upchieve.surveys ON upchieve.surveys.id = ssq.survey_id
    JOIN upchieve.survey_questions sq ON sq.id = ssq.survey_question_id
    JOIN UNNEST(ARRAY[10, 20, 30, 40, 50, 60, 70, 80, 90, 100]) AS sub ON TRUE
WHERE (upchieve.surveys.name = 'Progress Report Rating Survey'
    AND sq.question_text = 'Rate your analysis'
    AND rc.choice_text = 'Like'
    AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'Progress Report Rating Survey'
        AND sq.question_text = 'Rate your analysis'
        AND rc.choice_text = 'Dislike'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'Progress Report Rating Survey'
        AND sq.question_text = 'What was the problem'
        AND rc.choice_text = 'Score''s too high'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'Progress Report Rating Survey'
        AND sq.question_text = 'What was the problem'
        AND rc.choice_text = 'Score''s too low'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'Progress Report Rating Survey'
        AND sq.question_text = 'What was the problem'
        AND rc.choice_text = 'My coach was bad'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'Progress Report Rating Survey'
        AND sq.question_text = 'What was the problem'
        AND rc.choice_text = 'What you told me to do is not helpful'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'Progress Report Rating Survey'
        AND sq.question_text = 'What was the problem'
        AND rc.choice_text = 'These aren''t the concepts I''m studying'
        AND sub.text::int = 50)
    OR (upchieve.surveys.name = 'Progress Report Rating Survey'
        AND sq.question_text = 'What was the problem'
        AND rc.choice_text = 'Other'
        AND sub.text::int = 60)
    OR (upchieve.surveys.name = 'Progress Report Rating Survey'
        AND sq.question_text = 'Tell us more about the issue or how we can improve'
        AND rc.choice_text = 'Other'
        AND sub.text::int = 10);

-- migrate:down
ALTER TABLE upchieve.users_surveys
    DROP COLUMN IF NOT EXISTS progress_report_id;

DELETE FROM upchieve.surveys
WHERE upchieve.surveys.name = 'Progress Report Rating Survey';

DELETE FROM upchieve.survey_types
WHERE upchieve.survey_types.name = 'progress-report';

DELETE FROM upchieve.surveys_context USING upchieve.surveys
WHERE upchieve.surveys_context.survey_id = surveys.id
    AND surveys.name IN ('Progress Report Rating Survey');

DELETE FROM upchieve.survey_questions (question_type_id, question_text, created_at, updated_at)
WHERE question_text = 'Rate your analysis'
    OR question_text = 'What was the problem'
    OR question_text = 'Tell us more about the issue or how we can improve';

DELETE FROM upchieve.survey_questions_response_choices USING upchieve.surveys_survey_questions, upchieve.surveys
WHERE upchieve.surveys_survey_questions.id = upchieve.surveys_survey_questions.id
    AND upchieve.surveys_survey_questions.survey_id = upchieve.surveys.id
    AND surveys.name IN ('Progress Report Rating Survey');

DELETE FROM upchieve.survey_response_choices
WHERE upchieve.survey_response_choices.choice_text IN ('Like', 'Dislike', 'Score''s too high', 'Score''s too low', 'My coach was bad', 'What you told me to do is not helpful', 'These aren''t the concepts I''m studying');

DELETE FROM upchieve.surveys_survey_questions USING upchieve.surveys
WHERE upchieve.surveys_survey_questions.survey_id = surveys.id
    AND surveys.name IN ('Progress Report Rating Survey');


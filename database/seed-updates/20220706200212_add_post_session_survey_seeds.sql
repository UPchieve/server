-- migrate:up
INSERT INTO upchieve.survey_types (name, created_at, updated_at)
VALUES ('postsession', NOW(), NOW())
ON CONFLICT ON CONSTRAINT survey_types_name_key
  DO NOTHING;

INSERT INTO upchieve.surveys (name, created_at, updated_at)
VALUES ('Post-session SURVEY TEST', NOW(), NOW())
ON CONFLICT ON CONSTRAINT surveys_name_key
  DO NOTHING;

INSERT INTO upchieve.survey_questions (question_type_id, question_text, created_at, updated_at)
SELECT
  upchieve.question_types.id,
  sub.text,
  NOW(),
  NOW()
FROM upchieve.question_types
JOIN UNNEST(ARRAY[
  'Multiple-choice postsession test question?'
]) AS sub ON TRUE
WHERE
  upchieve.question_types.name = 'multiple choice';

INSERT INTO upchieve.survey_response_choices (score, choice_text, created_at, updated_at)
VALUES (0, 'multiple-choice q1 option1', NOW(), NOW()),
       (0, 'multiple-choice q1 option2', NOW(), NOW()),
       (0, 'multiple-choice q1 option3', NOW(), NOW());

INSERT INTO upchieve.surveys_survey_questions (survey_id, survey_question_id, display_priority, created_at, updated_at)
SELECT
  upchieve.surveys.id,
  upchieve.survey_questions.id,
  sub.text::int,
  NOW(),
  NOW()
FROM upchieve.surveys
JOIN upchieve.survey_questions ON TRUE
JOIN UNNEST(ARRAY[10, 20, 30, 40, 50, 60, 70, 80, 90, 100]) AS sub ON TRUE
WHERE
  (upchieve.surveys.name = 'Post-session SURVEY TEST'
    AND upchieve.survey_questions.question_text = 'Multiple-choice postsession test question?' AND sub.text::int = 10);

INSERT INTO upchieve.survey_questions_response_choices (surveys_survey_question_id, response_choice_id, display_priority, created_at, updated_at)
SELECT
  ssq.id,
  rc.id,
  sub.text::int,
  NOW(),
  NOW()
FROM upchieve.surveys_survey_questions ssq
JOIN upchieve.survey_response_choices rc ON TRUE
JOIN upchieve.surveys ON upchieve.surveys.id = ssq.survey_id
JOIN upchieve.survey_questions sq ON sq.id = ssq.survey_question_id
JOIN UNNEST(ARRAY[10, 20, 30, 40, 50, 60, 70, 80, 90, 100]) AS sub ON TRUE
WHERE
  (upchieve.surveys.name = 'Post-session SURVEY TEST' AND sq.question_text = 'Multiple-choice postsession test question?' AND rc.choice_text = 'multiple-choice q1 option1' AND sub.text::int = 10) OR
  (upchieve.surveys.name = 'Post-session SURVEY TEST' AND sq.question_text = 'Multiple-choice postsession test question?' AND rc.choice_text = 'multiple-choice q1 option2' AND sub.text::int = 20) OR
  (upchieve.surveys.name = 'Post-session SURVEY TEST' AND sq.question_text = 'Multiple-choice postsession test question?' AND rc.choice_text = 'multiple-choice q1 option3' AND sub.text::int = 30);

INSERT INTO upchieve.surveys_context (survey_id, subject_id, survey_type_id, created_at, updated_at)
SELECT
  upchieve.surveys.id,
  upchieve.subjects.id,
  upchieve.survey_types.id,
  NOW(),
  NOW()
FROM upchieve.surveys
JOIN upchieve.subjects ON TRUE
JOIN upchieve.survey_types ON TRUE
WHERE
  (upchieve.surveys.name = 'Post-session SURVEY TEST' AND upchieve.subjects.name = 'prealgebra' AND upchieve.survey_types.name = 'postsession');

-- migrate:down

DELETE FROM upchieve.survey_types
  WHERE upchieve.survey_types.name = 'postsession';

DELETE FROM upchieve.surveys
  WHERE upchieve.surveys.name = 'Post-session SURVEY TEST';

DELETE FROM upchieve.survey_questions
  WHERE upchieve.survey_questions.question_text = 'Multiple-choice postsession test question?';

DELETE FROM upchieve.survey_response_choices
  WHERE upchieve.survey_response_choices.choice_text = 'multiple-choice q1 option1'
  OR upchieve.survey_response_choices.choice_text = 'multiple-choice q1 option2'
  OR upchieve.survey_response_choices.choice_text = 'multiple-choice q1 option3';

DELETE FROM upchieve.surveys_survey_questions USING upchieve.surveys_context, upchieve.survey_types
  WHERE upchieve.surveys_survey_questions.id = upchieve.surveys_context.survey_id
  AND upchieve.surveys_context.survey_type_id = upchieve.survey_types.id
  AND upchieve.survey_types.name = 'postsession';

DELETE FROM upchieve.surveys_context USING upchieve.survey_types
  WHERE upchieve.surveys_context.survey_type_id = upchieve.survey_types.id
  AND upchieve.survey_types.name = 'postsession';
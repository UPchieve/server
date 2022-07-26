-- migrate:up

-- delete the duplicate response choice options
DELETE FROM
  upchieve.survey_response_choices src1 USING upchieve.survey_response_choices src2
WHERE
  src1.id > src2.id
  AND src1.choice_text = src2.choice_text;


INSERT INTO upchieve.surveys (name, created_at, updated_at)
VALUES ('U.S. History Pre-Session Survey', NOW(), NOW())
ON CONFLICT ON CONSTRAINT surveys_name_key
  DO NOTHING;


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
  (upchieve.surveys.name = 'U.S. History Pre-Session Survey' AND upchieve.subjects.name = 'usHistory' AND upchieve.survey_types.name = 'presession');


INSERT INTO upchieve.survey_response_choices (score, choice_text, created_at, updated_at)
VALUES (0, 'Answer US History text questions', NOW(), NOW()),
       (0, 'Develop a thesis statement or essay topic', NOW(), NOW());


INSERT INTO upchieve.surveys_survey_questions (survey_id, survey_question_id, display_priority, created_at, updated_at)
SELECT
  upchieve.surveys.id,
  upchieve.survey_questions.id,
  sub.text::int,
  NOW(),
  NOW()
FROM upchieve.surveys
JOIN upchieve.survey_questions ON TRUE
JOIN UNNEST(ARRAY[10, 20, 30]) AS sub ON TRUE
WHERE
  (upchieve.surveys.name = 'U.S. History Pre-Session Survey' AND upchieve.survey_questions.question_text = 'What is your primary goal for today''s session?' AND sub.text::int = 10) OR

  (upchieve.surveys.name = 'U.S. History Pre-Session Survey' AND upchieve.survey_questions.question_text = 'How well do you understand the topic you want to talk about today?' AND sub.text::int = 20) OR

  (upchieve.surveys.name = 'U.S. History Pre-Session Survey' AND upchieve.survey_questions.question_text = 'Overall, how do you feel about %s?' AND sub.text::int = 30);


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
  (upchieve.surveys.name = 'U.S. History Pre-Session Survey' AND sq.question_text = 'What is your primary goal for today''s session?' AND rc.choice_text = 'Answer US History text questions' AND sub.text::int = 10) OR
  (upchieve.surveys.name = 'U.S. History Pre-Session Survey' AND sq.question_text = 'What is your primary goal for today''s session?' AND rc.choice_text = 'Check my answers' AND sub.text::int = 20) OR
  (upchieve.surveys.name = 'U.S. History Pre-Session Survey' AND sq.question_text = 'What is your primary goal for today''s session?' AND rc.choice_text = 'Prepare for a quiz/test' AND sub.text::int = 30) OR
  (upchieve.surveys.name = 'U.S. History Pre-Session Survey' AND sq.question_text = 'What is your primary goal for today''s session?' AND rc.choice_text = 'Develop a thesis statement or essay topic' AND sub.text::int = 40) OR
  (upchieve.surveys.name = 'U.S. History Pre-Session Survey' AND sq.question_text = 'What is your primary goal for today''s session?' AND rc.choice_text = 'Deepen my understanding of a concept' AND sub.text::int = 50) OR
  (upchieve.surveys.name = 'U.S. History Pre-Session Survey' AND sq.question_text = 'What is your primary goal for today''s session?' AND rc.choice_text = 'I''m curious and want to learn something new' AND sub.text::int = 60) OR
  (upchieve.surveys.name = 'U.S. History Pre-Session Survey' AND sq.question_text = 'What is your primary goal for today''s session?' AND rc.choice_text = 'Other' AND sub.text::int = 70) OR 

  (upchieve.surveys.name = 'U.S. History Pre-Session Survey' AND sq.question_text = 'How well do you understand the topic you want to talk about today?' AND rc.choice_text = 'Not at all' AND sub.text::int = 10) OR 
  (upchieve.surveys.name = 'U.S. History Pre-Session Survey' AND sq.question_text = 'How well do you understand the topic you want to talk about today?' AND rc.choice_text = 'A little' AND sub.text::int = 20) OR 
  (upchieve.surveys.name = 'U.S. History Pre-Session Survey' AND sq.question_text = 'How well do you understand the topic you want to talk about today?' AND rc.choice_text = 'A medium amount' AND sub.text::int = 30) OR 
  (upchieve.surveys.name = 'U.S. History Pre-Session Survey' AND sq.question_text = 'How well do you understand the topic you want to talk about today?' AND rc.choice_text = 'Really well' AND sub.text::int = 40) OR 
  (upchieve.surveys.name = 'U.S. History Pre-Session Survey' AND sq.question_text = 'How well do you understand the topic you want to talk about today?' AND rc.choice_text = 'Almost perfectly' AND sub.text::int = 50) OR 

  (upchieve.surveys.name = 'U.S. History Pre-Session Survey' AND sq.question_text = 'Overall, how do you feel about %s?' AND rc.choice_text = 'Stressed' AND sub.text::int = 10) OR 
  (upchieve.surveys.name = 'U.S. History Pre-Session Survey' AND sq.question_text = 'Overall, how do you feel about %s?' AND rc.choice_text = 'Nervous' AND sub.text::int = 20) OR 
  (upchieve.surveys.name = 'U.S. History Pre-Session Survey' AND sq.question_text = 'Overall, how do you feel about %s?' AND rc.choice_text = 'Neutral' AND sub.text::int = 30) OR 
  (upchieve.surveys.name = 'U.S. History Pre-Session Survey' AND sq.question_text = 'Overall, how do you feel about %s?' AND rc.choice_text = 'Optimistic' AND sub.text::int = 40) OR 
  (upchieve.surveys.name = 'U.S. History Pre-Session Survey' AND sq.question_text = 'Overall, how do you feel about %s?' AND rc.choice_text = 'Confident' AND sub.text::int = 50);


-- migrate:down

DELETE FROM upchieve.surveys
  WHERE upchieve.surveys.name = 'U.S. History Pre-Session Survey';

DELETE FROM upchieve.survey_response_choices
  WHERE upchieve.survey_response_choices.choice_text in (
    'Answer US History text questions',
    'Develop a thesis statement or essay topic'
  );
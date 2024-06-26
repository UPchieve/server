-- migrate:up
INSERT INTO upchieve.surveys (name, role_id, created_at, updated_at)
    VALUES ('Essay Planning Pre-Session Survey', 1, NOW(), NOW()), ('Essay Feedback Pre-Session Survey', 1, NOW(), NOW())
ON CONFLICT ON CONSTRAINT surveys_name_key
    DO NOTHING;

INSERT INTO upchieve.surveys_context (survey_id, subject_id, survey_type_id, created_at, updated_at)
SELECT
    upchieve.surveys.id,
    upchieve.subjects.id,
    upchieve.survey_types.id,
    NOW(),
    NOW()
FROM
    upchieve.surveys
    JOIN upchieve.subjects ON TRUE
    JOIN upchieve.survey_types ON TRUE
WHERE (upchieve.surveys.name = 'Essay Planning Pre-Session Survey'
    AND upchieve.subjects.name = 'essayPlanning'
    AND upchieve.survey_types.name = 'presession');

INSERT INTO upchieve.surveys_context (survey_id, subject_id, survey_type_id, created_at, updated_at)
SELECT
    upchieve.surveys.id,
    upchieve.subjects.id,
    upchieve.survey_types.id,
    NOW(),
    NOW()
FROM
    upchieve.surveys
    JOIN upchieve.subjects ON TRUE
    JOIN upchieve.survey_types ON TRUE
WHERE (upchieve.surveys.name = 'Essay Feedback Pre-Session Survey'
    AND upchieve.subjects.name = 'essayFeedback'
    AND upchieve.survey_types.name = 'presession');

INSERT INTO upchieve.survey_response_choices (score, choice_text, created_at, updated_at)
    VALUES (0, 'Brainstorm an essay topic', NOW(), NOW()), (0, 'Gather information or research', NOW(), NOW());

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
WHERE (upchieve.surveys.name = 'Essay Planning Pre-Session Survey'
    AND upchieve.survey_questions.question_text = 'What is your primary goal for today''s session?'
    AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'Essay Feedback Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'What is your primary goal for today''s session?'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'Essay Planning Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'How well do you understand the topic you want to talk about today?'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'Essay Feedback Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'How well do you understand the topic you want to talk about today?'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'Essay Planning Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'Overall, how do you feel about %s?'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'Essay Feedback Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'Overall, how do you feel about %s?'
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
WHERE (upchieve.surveys.name = 'Essay Planning Pre-Session Survey'
    AND sq.question_text = 'What is your primary goal for today''s session?'
    AND rc.choice_text = 'Brainstorm an essay topic'
    AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'Essay Planning Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Gather information or research'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'Essay Planning Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Develop a thesis statement'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'Essay Planning Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Create an outline'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'Essay Planning Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Other'
        AND sub.text::int = 50)
    OR (upchieve.surveys.name = 'Essay Feedback Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Revise essay structure and ideas'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'Essay Feedback Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Edit grammar'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'Essay Feedback Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Other'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'Essay Planning Pre-Session Survey'
        AND sq.question_text = 'How well do you understand the topic you want to talk about today?'
        AND rc.choice_text = 'Not at all'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'Essay Planning Pre-Session Survey'
        AND sq.question_text = 'How well do you understand the topic you want to talk about today?'
        AND rc.choice_text = 'A little'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'Essay Planning Pre-Session Survey'
        AND sq.question_text = 'How well do you understand the topic you want to talk about today?'
        AND rc.choice_text = 'A medium amount'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'Essay Planning Pre-Session Survey'
        AND sq.question_text = 'How well do you understand the topic you want to talk about today?'
        AND rc.choice_text = 'Really well'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'Essay Planning Pre-Session Survey'
        AND sq.question_text = 'How well do you understand the topic you want to talk about today?'
        AND rc.choice_text = 'Almost perfectly'
        AND sub.text::int = 50)
    OR (upchieve.surveys.name = 'Essay Feedback Pre-Session Survey'
        AND sq.question_text = 'How well do you understand the topic you want to talk about today?'
        AND rc.choice_text = 'Not at all'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'Essay Feedback Pre-Session Survey'
        AND sq.question_text = 'How well do you understand the topic you want to talk about today?'
        AND rc.choice_text = 'A little'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'Essay Feedback Pre-Session Survey'
        AND sq.question_text = 'How well do you understand the topic you want to talk about today?'
        AND rc.choice_text = 'A medium amount'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'Essay Feedback Pre-Session Survey'
        AND sq.question_text = 'How well do you understand the topic you want to talk about today?'
        AND rc.choice_text = 'Really well'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'Essay Feedback Pre-Session Survey'
        AND sq.question_text = 'How well do you understand the topic you want to talk about today?'
        AND rc.choice_text = 'Almost perfectly'
        AND sub.text::int = 50)
    OR (upchieve.surveys.name = 'Essay Planning Pre-Session Survey'
        AND sq.question_text = 'Overall, how do you feel about %s?'
        AND rc.choice_text = 'Stressed'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'Essay Planning Pre-Session Survey'
        AND sq.question_text = 'Overall, how do you feel about %s?'
        AND rc.choice_text = 'Nervous'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'Essay Planning Pre-Session Survey'
        AND sq.question_text = 'Overall, how do you feel about %s?'
        AND rc.choice_text = 'Neutral'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'Essay Planning Pre-Session Survey'
        AND sq.question_text = 'Overall, how do you feel about %s?'
        AND rc.choice_text = 'Optimistic'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'Essay Planning Pre-Session Survey'
        AND sq.question_text = 'Overall, how do you feel about %s?'
        AND rc.choice_text = 'Confident'
        AND sub.text::int = 50)
    OR (upchieve.surveys.name = 'Essay Feedback Pre-Session Survey'
        AND sq.question_text = 'Overall, how do you feel about %s?'
        AND rc.choice_text = 'Stressed'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'Essay Feedback Pre-Session Survey'
        AND sq.question_text = 'Overall, how do you feel about %s?'
        AND rc.choice_text = 'Nervous'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'Essay Feedback Pre-Session Survey'
        AND sq.question_text = 'Overall, how do you feel about %s?'
        AND rc.choice_text = 'Neutral'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'Essay Feedback Pre-Session Survey'
        AND sq.question_text = 'Overall, how do you feel about %s?'
        AND rc.choice_text = 'Optimistic'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'Essay Feedback Pre-Session Survey'
        AND sq.question_text = 'Overall, how do you feel about %s?'
        AND rc.choice_text = 'Confident'
        AND sub.text::int = 50);

-- migrate:down
DELETE FROM upchieve.surveys
WHERE upchieve.surveys.name = 'Essay Planning Pre-Session Survey'
    OR upchieve.surveys.name = 'Essay Feedback Pre-Session Survey';

DELETE FROM upchieve.surveys_context USING upchieve.surveys
WHERE upchieve.surveys_context.survey_id = surveys.id
    AND surveys.name IN ('Essay Planning Pre-Session Survey', 'Essay Feedback Pre-Session Survey');

DELETE FROM upchieve.survey_questions_response_choices USING upchieve.surveys_survey_questions, upchieve.surveys
WHERE upchieve.surveys_survey_questions.id = upchieve.surveys_survey_questions.id
    AND upchieve.surveys_survey_questions.survey_id = upchieve.surveys.id
    AND surveys.name IN ('Essay Planning Pre-Session Survey', 'Essay Feedback Pre-Session Survey');

DELETE FROM upchieve.survey_response_choices
WHERE upchieve.survey_response_choices.choice_text IN ('Brainstorm an essay topic', 'Gather information or research');

DELETE FROM upchieve.surveys_survey_questions USING upchieve.surveys
WHERE upchieve.surveys_survey_questions.survey_id = surveys.id
    AND surveys.name IN ('Essay Planning Pre-Session Survey', 'Essay Feedback Pre-Session Survey');


-- migrate:up
INSERT INTO upchieve.survey_response_choices (score, choice_text, created_at, updated_at)
    VALUES (0, 'A/A+', NOW(), NOW()), (0, 'A-', NOW(), NOW()), (0, 'B+', NOW(), NOW()), (0, 'B', NOW(), NOW()), (0, 'B-', NOW(), NOW()), (0, 'C+', NOW(), NOW()), (0, 'C', NOW(), NOW()), (0, 'C-', NOW(), NOW()), (0, 'D', NOW(), NOW()), (0, 'F', NOW(), NOW());

DELETE FROM upchieve.survey_questions_response_choices sqrc
WHERE sqrc.surveys_survey_question_id = (
        SELECT
            ssq.id
        FROM
            upchieve.surveys_survey_questions ssq
            JOIN upchieve.surveys s ON s.id = ssq.survey_id
            JOIN upchieve.survey_questions sq ON sq.id = ssq.survey_question_id
        WHERE
            s.name = 'Impact Study Survey 1.0'
            AND sq.question_text = 'What is your lowest grade?');

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
    JOIN upchieve.surveys s ON s.id = ssq.survey_id
    JOIN upchieve.survey_questions sq ON sq.id = ssq.survey_question_id
    CROSS JOIN UNNEST(ARRAY[10, 20, 30, 40, 50, 60, 70, 80, 90, 100]) AS sub (text)
WHERE (s.name = 'Impact Study Survey 1.0'
    AND sq.question_text = 'What is your lowest grade?'
    AND rc.choice_text = 'A/A+'
    AND sub.text::int = 10)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your lowest grade?'
        AND rc.choice_text = 'A-'
        AND sub.text::int = 20)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your lowest grade?'
        AND rc.choice_text = 'B+'
        AND sub.text::int = 30)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your lowest grade?'
        AND rc.choice_text = 'B'
        AND sub.text::int = 40)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your lowest grade?'
        AND rc.choice_text = 'B-'
        AND sub.text::int = 50)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your lowest grade?'
        AND rc.choice_text = 'C+'
        AND sub.text::int = 60)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your lowest grade?'
        AND rc.choice_text = 'C'
        AND sub.text::int = 70)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your lowest grade?'
        AND rc.choice_text = 'C-'
        AND sub.text::int = 80)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your lowest grade?'
        AND rc.choice_text = 'D'
        AND sub.text::int = 90)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your lowest grade?'
        AND rc.choice_text = 'F'
        AND sub.text::int = 100);

-- migrate:down
DELETE FROM upchieve.survey_questions_response_choices
WHERE surveys_survey_question_id IN (
        SELECT
            ssq.id
        FROM
            upchieve.surveys_survey_questions ssq
            JOIN upchieve.surveys s ON s.id = ssq.survey_id
            JOIN upchieve.survey_questions sq ON sq.id = ssq.survey_question_id
        WHERE
            s.name = 'Impact Study Survey 1.0'
            AND sq.question_text = 'What is your lowest grade?');

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
    JOIN upchieve.surveys s ON s.id = ssq.survey_id
    JOIN upchieve.survey_questions sq ON sq.id = ssq.survey_question_id
    CROSS JOIN UNNEST(ARRAY[10, 20, 30, 40, 50, 60, 70, 80]) AS sub (text)
WHERE (s.name = 'Impact Study Survey 1.0'
    AND sq.question_text = 'What is your lowest grade?'
    AND rc.choice_text = 'A''s'
    AND sub.text::int = 10)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your lowest grade?'
        AND rc.choice_text = 'A''s and B''s'
        AND sub.text::int = 20)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your lowest grade?'
        AND rc.choice_text = 'B''s'
        AND sub.text::int = 30)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your lowest grade?'
        AND rc.choice_text = 'B''s and C''s'
        AND sub.text::int = 40)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your lowest grade?'
        AND rc.choice_text = 'C''s'
        AND sub.text::int = 50)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your lowest grade?'
        AND rc.choice_text = 'C''s and D''s'
        AND sub.text::int = 60)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your lowest grade?'
        AND rc.choice_text = 'D''s'
        AND sub.text::int = 70)
    OR (s.name = 'Impact Study Survey 1.0'
        AND sq.question_text = 'What is your lowest grade?'
        AND rc.choice_text = 'D''s and below'
        AND sub.text::int = 80);


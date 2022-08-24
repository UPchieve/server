-- migrate:up
UPDATE
    upchieve.survey_questions
SET
    response_display_text = 'Their goal:',
    updated_at = NOW()
WHERE
    upchieve.survey_questions.question_text = 'What is your primary goal for today''s session?';

UPDATE
    upchieve.survey_questions
SET
    response_display_text = 'Their progress:',
    updated_at = NOW()
WHERE
    upchieve.survey_questions.question_text = 'Where are you in the process of reaching your goal?';

UPDATE
    upchieve.survey_questions
SET
    response_display_text = 'Their confidence:',
    updated_at = NOW()
WHERE
    upchieve.survey_questions.question_text = 'How do you feel about your ability to get accepted to college?';

UPDATE
    upchieve.survey_questions
SET
    response_display_text = 'Their progress:',
    updated_at = NOW()
WHERE
    upchieve.survey_questions.question_text = 'Where are you in the process of learning this specific topic?';

UPDATE
    upchieve.survey_questions
SET
    response_display_text = 'Their confidence:',
    updated_at = NOW()
WHERE
    upchieve.survey_questions.question_text = 'How do you feel about your ability to learn this topic?';

-- migrate:down
UPDATE
    upchieve.survey_questions
SET
    response_display_text = NULL,
    updated_at = NOW();


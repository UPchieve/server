-- migrate:up
UPDATE
    upchieve.survey_questions
SET
    replacement_column_1 = 'student_name',
    replacement_column_2 = 'student_goal',
    updated_at = NOW()
WHERE
    upchieve.survey_questions.question_text = '%s''s goal for this session was to %s. Were you able to help them achieve their goal?';

UPDATE
    upchieve.survey_questions
SET
    replacement_column_1 = 'student_goal',
    updated_at = NOW()
WHERE
    upchieve.survey_questions.question_text = 'Your goal for this session was to %s. Did UPchieve help you achieve your goal?';

UPDATE
    upchieve.survey_questions
SET
    replacement_column_1 = 'coach_name',
    updated_at = NOW()
WHERE
    upchieve.survey_questions.question_text = 'Would you like to favorite your coach %s?';

UPDATE
    upchieve.survey_questions
SET
    replacement_column_1 = 'student_name',
    replacement_column_2 = 'subject_name',
    updated_at = NOW()
WHERE
    upchieve.survey_questions.question_text = 'How do you think %s feels about %s at the end of this session?'
    OR upchieve.survey_questions.question_text = 'How do you think %s feels about the %s at the end of this session?';

UPDATE
    upchieve.survey_questions
SET
    replacement_column_1 = 'student_name',
    updated_at = NOW()
WHERE
    upchieve.survey_questions.question_text = 'How do you think %s feels about applying to college at the end of this session?';

UPDATE
    upchieve.survey_questions
SET
    replacement_column_1 = 'subject_name',
    updated_at = NOW()
WHERE
    upchieve.survey_questions.question_text = 'Overall, how do you feel about the %s section?'
    OR upchieve.survey_questions.question_text = 'Overall, how do you feel about %s?';

-- migrate:down
UPDATE
    upchieve.survey_questions
SET
    replacement_column_1 = NULL,
    replacement_column_2 = NULL

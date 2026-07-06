-- migrate:up
INSERT INTO upchieve.surveys (name, role_id, reward_amount, created_at, updated_at)
    VALUES ('Student Post-Session Reflection Survey', 1, NULL, NOW(), NOW()), ('Student Post-Session Reflection and Core Survey', 1, NULL, NOW(), NOW())
ON CONFLICT (name)
    DO NOTHING;

INSERT INTO upchieve.survey_questions (question_type_id, question_text, replacement_column_1, created_at, updated_at)
SELECT
    qt.id,
    new_questions.question_text,
    new_questions.replacement_column_1,
    NOW(),
    NOW()
FROM
    upchieve.question_types qt
    JOIN (
        VALUES ('multiple choice', 'How confident are you right now that you can solve problems like the one you worked on today - on your own?', NULL),
            ('multiple choice', 'During today''s session, I felt like someone who can succeed in %s.', 'subject_name'),
            ('multiple choice', 'After this session, I want to keep working on %s.', 'subject_name'),
            ('free response', 'How far in school do you think you will get?', NULL)) AS new_questions (question_type_name, question_text, replacement_column_1) ON new_questions.question_type_name = qt.name;

INSERT INTO upchieve.surveys_survey_questions (survey_id, survey_question_id, display_priority, created_at, updated_at)
SELECT
    s.id,
    sq.id,
    survey_questions.display_priority,
    NOW(),
    NOW()
FROM
    upchieve.surveys s
    JOIN (
        VALUES ('Student Post-Session Reflection Survey', 'How confident are you right now that you can solve problems like the one you worked on today - on your own?', 10),
            ('Student Post-Session Reflection Survey', 'During today''s session, I felt like someone who can succeed in %s.', 20),
            ('Student Post-Session Reflection Survey', 'After this session, I want to keep working on %s.', 30),
            ('Student Post-Session Reflection Survey', 'How far in school do you think you will get?', 40),
            ('Student Post-Session Reflection and Core Survey', 'Your goal for this session was to %s. Did UPchieve help you achieve your goal?', 10),
            ('Student Post-Session Reflection and Core Survey', 'Sorry to hear that, what happened?', 20),
            ('Student Post-Session Reflection and Core Survey', 'Would you like to favorite your coach %s?', 30),
            ('Student Post-Session Reflection and Core Survey', 'How confident are you right now that you can solve problems like the one you worked on today - on your own?', 40),
            ('Student Post-Session Reflection and Core Survey', 'During today''s session, I felt like someone who can succeed in %s.', 50),
            ('Student Post-Session Reflection and Core Survey', 'After this session, I want to keep working on %s.', 60),
            ('Student Post-Session Reflection and Core Survey', 'How far in school do you think you will get?', 70),
            ('Student Post-Session Reflection and Core Survey', 'Overall, how supportive was your coach today?', 80),
            ('Student Post-Session Reflection and Core Survey', 'Overall, how much did your coach push you to do your best work today?', 90),
            ('Student Post-Session Reflection and Core Survey', 'This can be about the web app, the Academic Coach who helped you, the services UPchieve offers, etc.', 100)) AS survey_questions (survey_name, question_text, display_priority) ON survey_questions.survey_name = s.name
    JOIN upchieve.survey_questions sq ON sq.question_text = survey_questions.question_text;

INSERT INTO upchieve.survey_questions_response_choices (surveys_survey_question_id, response_choice_id, display_priority, created_at, updated_at)
SELECT
    ssq.id,
    rc.id,
    reflection_response_choices.display_priority,
    NOW(),
    NOW()
FROM
    upchieve.surveys_survey_questions ssq
    JOIN upchieve.surveys s ON s.id = ssq.survey_id
    JOIN upchieve.survey_questions sq ON sq.id = ssq.survey_question_id
    JOIN upchieve.survey_response_choices rc ON TRUE
    JOIN (
        VALUES ('How confident are you right now that you can solve problems like the one you worked on today - on your own?', 'Not at all', 10),
            ('How confident are you right now that you can solve problems like the one you worked on today - on your own?', 'A little', 20),
            ('How confident are you right now that you can solve problems like the one you worked on today - on your own?', 'Somewhat', 30),
            ('How confident are you right now that you can solve problems like the one you worked on today - on your own?', 'Mostly', 40),
            ('How confident are you right now that you can solve problems like the one you worked on today - on your own?', 'Extremely', 50),
            ('During today''s session, I felt like someone who can succeed in %s.', 'Not at all', 10),
            ('During today''s session, I felt like someone who can succeed in %s.', 'A little', 20),
            ('During today''s session, I felt like someone who can succeed in %s.', 'Somewhat', 30),
            ('During today''s session, I felt like someone who can succeed in %s.', 'Mostly', 40),
            ('During today''s session, I felt like someone who can succeed in %s.', 'Extremely', 50),
            ('After this session, I want to keep working on %s.', 'Not at all', 10),
            ('After this session, I want to keep working on %s.', 'A little', 20),
            ('After this session, I want to keep working on %s.', 'Somewhat', 30),
            ('After this session, I want to keep working on %s.', 'Mostly', 40),
            ('After this session, I want to keep working on %s.', 'Extremely', 50),
            ('How far in school do you think you will get?', 'Your thoughts', 10)) AS reflection_response_choices (question_text, choice_text, display_priority) ON reflection_response_choices.question_text = sq.question_text
            AND reflection_response_choices.choice_text = rc.choice_text
    WHERE
        s.name IN ('Student Post-Session Reflection Survey', 'Student Post-Session Reflection and Core Survey');

INSERT INTO upchieve.survey_questions_response_choices (surveys_survey_question_id, response_choice_id, display_priority, created_at, updated_at)
SELECT
    ssq.id,
    rc.id,
    core_response_choices.display_priority,
    NOW(),
    NOW()
FROM
    upchieve.surveys_survey_questions ssq
    JOIN upchieve.surveys s ON s.id = ssq.survey_id
    JOIN upchieve.survey_questions sq ON sq.id = ssq.survey_question_id
    JOIN upchieve.survey_response_choices rc ON TRUE
    JOIN (
        VALUES ('Your goal for this session was to %s. Did UPchieve help you achieve your goal?', 'Not at all', 10),
            ('Your goal for this session was to %s. Did UPchieve help you achieve your goal?', 'Sorta but not really', 20),
            ('Your goal for this session was to %s. Did UPchieve help you achieve your goal?', 'I guess so', 30),
            ('Your goal for this session was to %s. Did UPchieve help you achieve your goal?', 'I''m def closer to my goal', 40),
            ('Your goal for this session was to %s. Did UPchieve help you achieve your goal?', 'GOAL ACHIEVED', 50),
            ('Sorry to hear that, what happened?', 'Rude coach', 10),
            ('Sorry to hear that, what happened?', 'Coach didn''t know topic', 20),
            ('Sorry to hear that, what happened?', 'Coach slow to respond', 30),
            ('Sorry to hear that, what happened?', 'Ran out of time', 40),
            ('Sorry to hear that, what happened?', 'Tech issue', 50),
            ('Sorry to hear that, what happened?', 'Other', 60),
            ('Would you like to favorite your coach %s?', 'Yes', 10),
            ('Would you like to favorite your coach %s?', 'Maybe later', 20),
            ('Overall, how supportive was your coach today?', 'Not at all', 10),
            ('Overall, how supportive was your coach today?', 'Sorta but not really', 20),
            ('Overall, how supportive was your coach today?', 'Somewhat', 30),
            ('Overall, how supportive was your coach today?', 'Mostly', 40),
            ('Overall, how supportive was your coach today?', 'Extremely', 50),
            ('Overall, how much did your coach push you to do your best work today?', 'Not at all', 10),
            ('Overall, how much did your coach push you to do your best work today?', 'Sorta but not really', 20),
            ('Overall, how much did your coach push you to do your best work today?', 'Somewhat', 30),
            ('Overall, how much did your coach push you to do your best work today?', 'Mostly', 40),
            ('Overall, how much did your coach push you to do your best work today?', 'A lot', 50),
            ('This can be about the web app, the Academic Coach who helped you, the services UPchieve offers, etc.', 'Your thoughts', 10)) AS core_response_choices (question_text, choice_text, display_priority) ON core_response_choices.question_text = sq.question_text
            AND core_response_choices.choice_text = rc.choice_text
    WHERE
        s.name = 'Student Post-Session Reflection and Core Survey';

INSERT INTO upchieve.surveys_context (survey_id, subject_id, survey_type_id, created_at, updated_at)
SELECT
    s.id,
    sub.id,
    st.id,
    NOW(),
    NOW()
FROM
    upchieve.surveys s
    JOIN upchieve.subjects sub ON sub.name IN ('prealgebra', 'algebraOne', 'algebraTwo', 'geometry', 'trigonometry', 'precalculus', 'calculusAB', 'calculusBC', 'statistics', 'biology', 'chemistry', 'physicsOne', 'physicsTwo', 'environmentalScience', 'integratedMathOne', 'integratedMathTwo', 'integratedMathThree', 'integratedMathFour', 'humanitiesEssays', 'reading', 'planning', 'essays', 'applications', 'satMath', 'satReading')
    JOIN upchieve.survey_types st ON st.name = 'postsession'
WHERE
    s.name IN ('Student Post-Session Reflection and Core Survey', 'Student Post-Session Reflection Survey');

-- migrate:down

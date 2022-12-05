-- migrate:up
INSERT INTO upchieve.surveys (name, role_id, created_at, updated_at)
    VALUES ('College Prep Pre-Session Survey', 1, NOW(), NOW()), ('College List Pre-Session Survey', 1, NOW(), NOW()), ('College Apps Pre-Session Survey', 1, NOW(), NOW()), ('Application Essays Pre-Session Survey', 1, NOW(), NOW()), ('Financial Aid Pre-Session Survey', 1, NOW(), NOW())
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
WHERE (upchieve.surveys.name = 'College Prep Pre-Session Survey'
    AND upchieve.subjects.name = 'collegePrep'
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
WHERE (upchieve.surveys.name = 'College List Pre-Session Survey'
    AND upchieve.subjects.name = 'collegeList'
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
WHERE (upchieve.surveys.name = 'College Apps Pre-Session Survey'
    AND upchieve.subjects.name = 'collegeApps'
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
WHERE (upchieve.surveys.name = 'Application Essays Pre-Session Survey'
    AND upchieve.subjects.name = 'applicationEssays'
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
WHERE (upchieve.surveys.name = 'Financial Aid Pre-Session Survey'
    AND upchieve.subjects.name = 'financialAid'
    AND upchieve.survey_types.name = 'presession');

INSERT INTO upchieve.survey_response_choices (score, choice_text, created_at, updated_at)
    VALUES (0, 'Pick classes', NOW(), NOW()), (0, 'Choose extracurricular activities', NOW(), NOW()), (0, 'Find free summer programs', NOW(), NOW()), (0, 'Determine preferences', NOW(), NOW()), (0, 'Research colleges', NOW(), NOW()), (0, 'Balance your list', NOW(), NOW()), (0, 'Overview of financial aid', NOW(), NOW()), (0, 'Research scholarships', NOW(), NOW()), (0, 'Complete forms', NOW(), NOW()), (0, 'Understand aid letters', NOW(), NOW());

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
WHERE (upchieve.surveys.name = 'College Prep Pre-Session Survey'
    AND upchieve.survey_questions.question_text = 'What is your primary goal for today''s session?'
    AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'College List Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'What is your primary goal for today''s session?'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'College Apps Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'What is your primary goal for today''s session?'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'Application Essays Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'What is your primary goal for today''s session?'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'Financial Aid Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'What is your primary goal for today''s session?'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'College Prep Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'Where are you in the process of reaching your goal?'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'College List Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'Where are you in the process of reaching your goal?'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'College Apps Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'Where are you in the process of reaching your goal?'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'Application Essays Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'Where are you in the process of reaching your goal?'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'Financial Aid Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'Where are you in the process of reaching your goal?'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'College Prep Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'Overall, how do you feel about applying to college?'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'College List Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'Overall, how do you feel about applying to college?'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'College Apps Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'Overall, how do you feel about applying to college?'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'Application Essays Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'Overall, how do you feel about applying to college?'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'Financial Aid Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'Overall, how do you feel about applying to college?'
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
WHERE (upchieve.surveys.name = 'College Prep Pre-Session Survey'
    AND sq.question_text = 'What is your primary goal for today''s session?'
    AND rc.choice_text = 'Understand college requirements'
    AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'College Prep Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Pick classes'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'College Prep Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Choose extracurricular activities'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'College Prep Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Find free summer programs'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'College Prep Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Research majors or careers'
        AND sub.text::int = 50)
    OR (upchieve.surveys.name = 'College Prep Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Other'
        AND sub.text::int = 60)
    OR (upchieve.surveys.name = 'College List Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Determine preferences'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'College List Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Research colleges'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'College List Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Balance your list'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'College List Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Other'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'College Apps Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Understand the parts of an application'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'College Apps Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Create an application timeline'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'College Apps Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Work on an application'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'College Apps Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Prepare for an interview'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'College Apps Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Other'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'Application Essays Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Select a prompt and brainstorm topics'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'Application Essays Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Create an outline'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'Application Essays Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Revise essay structure and ideas'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'Application Essays Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Edit grammar'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'Application Essays Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Other'
        AND sub.text::int = 50)
    OR (upchieve.surveys.name = 'Financial Aid Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Overview of financial aid'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'Financial Aid Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Research scholarships'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'Financial Aid Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Complete forms'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'Financial Aid Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Understand aid letters'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'Financial Aid Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Other'
        AND sub.text::int = 50)
    OR (upchieve.surveys.name = 'College Prep Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of reaching your goal?'
        AND rc.choice_text = 'I haven''t started on this yet'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'College List Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of reaching your goal?'
        AND rc.choice_text = 'I haven''t started on this yet'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'College Apps Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of reaching your goal?'
        AND rc.choice_text = 'I haven''t started on this yet'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'Application Essays Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of reaching your goal?'
        AND rc.choice_text = 'I haven''t started on this yet'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'Financial Aid Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of reaching your goal?'
        AND rc.choice_text = 'I haven''t started on this yet'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'College Prep Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of reaching your goal?'
        AND rc.choice_text = 'I''ve done some work on this'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'College List Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of reaching your goal?'
        AND rc.choice_text = 'I''ve done some work on this'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'College Apps Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of reaching your goal?'
        AND rc.choice_text = 'I''ve done some work on this'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'Application Essays Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of reaching your goal?'
        AND rc.choice_text = 'I''ve done some work on this'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'Financial Aid Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of reaching your goal?'
        AND rc.choice_text = 'I''ve done some work on this'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'College Prep Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of reaching your goal?'
        AND rc.choice_text = 'I''m finishing this up'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'College List Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of reaching your goal?'
        AND rc.choice_text = 'I''m finishing this up'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'College Apps Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of reaching your goal?'
        AND rc.choice_text = 'I''m finishing this up'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'Application Essays Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of reaching your goal?'
        AND rc.choice_text = 'I''m finishing this up'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'Financial Aid Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of reaching your goal?'
        AND rc.choice_text = 'I''m finishing this up'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'College Prep Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of reaching your goal?'
        AND rc.choice_text = 'I''ve completed this'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'College List Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of reaching your goal?'
        AND rc.choice_text = 'I''ve completed this'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'College Apps Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of reaching your goal?'
        AND rc.choice_text = 'I''ve completed this'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'Application Essays Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of reaching your goal?'
        AND rc.choice_text = 'I''ve completed this'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'Financial Aid Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of reaching your goal?'
        AND rc.choice_text = 'I''ve completed this'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'College Prep Pre-Session Survey'
        AND sq.question_text = 'Overall, how do you feel about applying to college?'
        AND rc.choice_text = 'Stressed'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'College List Pre-Session Survey'
        AND sq.question_text = 'Overall, how do you feel about applying to college?'
        AND rc.choice_text = 'Stressed'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'College Apps Pre-Session Survey'
        AND sq.question_text = 'Overall, how do you feel about applying to college?'
        AND rc.choice_text = 'Stressed'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'Application Essays Pre-Session Survey'
        AND sq.question_text = 'Overall, how do you feel about applying to college?'
        AND rc.choice_text = 'Stressed'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'Financial Aid Pre-Session Survey'
        AND sq.question_text = 'Overall, how do you feel about applying to college?'
        AND rc.choice_text = 'Stressed'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'College Prep Pre-Session Survey'
        AND sq.question_text = 'Overall, how do you feel about applying to college?'
        AND rc.choice_text = 'Nervous'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'College List Pre-Session Survey'
        AND sq.question_text = 'Overall, how do you feel about applying to college?'
        AND rc.choice_text = 'Nervous'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'College Apps Pre-Session Survey'
        AND sq.question_text = 'Overall, how do you feel about applying to college?'
        AND rc.choice_text = 'Nervous'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'Application Essays Pre-Session Survey'
        AND sq.question_text = 'Overall, how do you feel about applying to college?'
        AND rc.choice_text = 'Nervous'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'Financial Aid Pre-Session Survey'
        AND sq.question_text = 'Overall, how do you feel about applying to college?'
        AND rc.choice_text = 'Nervous'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'College Prep Pre-Session Survey'
        AND sq.question_text = 'Overall, how do you feel about applying to college?'
        AND rc.choice_text = 'Neutral'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'College List Pre-Session Survey'
        AND sq.question_text = 'Overall, how do you feel about applying to college?'
        AND rc.choice_text = 'Neutral'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'College Apps Pre-Session Survey'
        AND sq.question_text = 'Overall, how do you feel about applying to college?'
        AND rc.choice_text = 'Neutral'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'Application Essays Pre-Session Survey'
        AND sq.question_text = 'Overall, how do you feel about applying to college?'
        AND rc.choice_text = 'Neutral'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'Financial Aid Pre-Session Survey'
        AND sq.question_text = 'Overall, how do you feel about applying to college?'
        AND rc.choice_text = 'Neutral'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'College Prep Pre-Session Survey'
        AND sq.question_text = 'Overall, how do you feel about applying to college?'
        AND rc.choice_text = 'Optimistic'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'College List Pre-Session Survey'
        AND sq.question_text = 'Overall, how do you feel about applying to college?'
        AND rc.choice_text = 'Optimistic'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'College Apps Pre-Session Survey'
        AND sq.question_text = 'Overall, how do you feel about applying to college?'
        AND rc.choice_text = 'Optimistic'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'Application Essays Pre-Session Survey'
        AND sq.question_text = 'Overall, how do you feel about applying to college?'
        AND rc.choice_text = 'Optimistic'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'Financial Aid Pre-Session Survey'
        AND sq.question_text = 'Overall, how do you feel about applying to college?'
        AND rc.choice_text = 'Optimistic'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'College Prep Pre-Session Survey'
        AND sq.question_text = 'Overall, how do you feel about applying to college?'
        AND rc.choice_text = 'Confident'
        AND sub.text::int = 50)
    OR (upchieve.surveys.name = 'College List Pre-Session Survey'
        AND sq.question_text = 'Overall, how do you feel about applying to college?'
        AND rc.choice_text = 'Confident'
        AND sub.text::int = 50)
    OR (upchieve.surveys.name = 'College Apps Pre-Session Survey'
        AND sq.question_text = 'Overall, how do you feel about applying to college?'
        AND rc.choice_text = 'Confident'
        AND sub.text::int = 50)
    OR (upchieve.surveys.name = 'Application Essays Pre-Session Survey'
        AND sq.question_text = 'Overall, how do you feel about applying to college?'
        AND rc.choice_text = 'Confident'
        AND sub.text::int = 50)
    OR (upchieve.surveys.name = 'Financial Aid Pre-Session Survey'
        AND sq.question_text = 'Overall, how do you feel about applying to college?'
        AND rc.choice_text = 'Confident'
        AND sub.text::int = 50);

-- migrate:down
DELETE FROM upchieve.surveys
WHERE upchieve.surveys.name = 'College Prep Pre-Session Survey'
    OR upchieve.surveys.name = 'College List Pre-Session Survey'
    OR upchieve.surveys.name = 'College Apps Pre-Session Survey'
    OR upchieve.surveys.name = 'Application Essays Pre-Session Survey'
    OR upchieve.surveys.name = 'Financial Aid Pre-Session Survey';

DELETE FROM upchieve.survey_response_choices
WHERE upchieve.survey_response_choices.choice_text IN ('Pick classes', 'Choose extracurricular activities', 'Find free summer programs', 'Determine preferences', 'Research colleges', 'Balance your list', 'Overview of financial aid', 'Research scholarships', 'Complete forms', 'Understand aid letters');


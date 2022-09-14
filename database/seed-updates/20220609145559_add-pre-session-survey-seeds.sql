-- migrate:up
INSERT INTO upchieve.surveys (name, created_at, updated_at)
    VALUES ('STEM Pre-Session Survey', NOW(), NOW()), ('Humanities Essays Pre-Session Survey', NOW(), NOW()), ('Reading Pre-Session Survey', NOW(), NOW()), ('College Planning Pre-Session Survey', NOW(), NOW()), ('College Essays Pre-Session Survey', NOW(), NOW()), ('College Applications Pre-Session Survey', NOW(), NOW()), ('SAT Prep Pre-Session Survey', NOW(), NOW())
ON CONFLICT ON CONSTRAINT surveys_name_key
    DO NOTHING;


/*
 * Removed due to dropping `surveys_presession` from schema in later schema
 * migration. Tables removed in schema migrations are applied before any seed
 * migrations so we need to remove "old" seed on newly dropped tables

INSERT INTO upchieve.surveys_presession (survey_id, subject_id, created_at, updated_at)
SELECT
 upchieve.surveys.id,
 upchieve.subjects.id,
 NOW(),
 NOW()
FROM upchieve.surveys
JOIN upchieve.subjects ON TRUE
WHERE
 (upchieve.surveys.name = 'STEM Pre-Session Survey' AND upchieve.subjects.name = 'prealgebra') OR
 (upchieve.surveys.name = 'STEM Pre-Session Survey' AND upchieve.subjects.name = 'algebraOne') OR
 (upchieve.surveys.name = 'STEM Pre-Session Survey' AND upchieve.subjects.name = 'algebraTwo') OR
 (upchieve.surveys.name = 'STEM Pre-Session Survey' AND upchieve.subjects.name = 'geometry') OR
 (upchieve.surveys.name = 'STEM Pre-Session Survey' AND upchieve.subjects.name = 'trigonometry') OR
 (upchieve.surveys.name = 'STEM Pre-Session Survey' AND upchieve.subjects.name = 'precalculus') OR
 (upchieve.surveys.name = 'STEM Pre-Session Survey' AND upchieve.subjects.name = 'calculusAB') OR
 (upchieve.surveys.name = 'STEM Pre-Session Survey' AND upchieve.subjects.name = 'calculusBC') OR
 (upchieve.surveys.name = 'STEM Pre-Session Survey' AND upchieve.subjects.name = 'statistics') OR
 (upchieve.surveys.name = 'STEM Pre-Session Survey' AND upchieve.subjects.name = 'biology') OR
 (upchieve.surveys.name = 'STEM Pre-Session Survey' AND upchieve.subjects.name = 'chemistry') OR
 (upchieve.surveys.name = 'STEM Pre-Session Survey' AND upchieve.subjects.name = 'physicsOne') OR
 (upchieve.surveys.name = 'STEM Pre-Session Survey' AND upchieve.subjects.name = 'physicsTwo') OR
 (upchieve.surveys.name = 'STEM Pre-Session Survey' AND upchieve.subjects.name = 'environmentalScience') OR
 (upchieve.surveys.name = 'STEM Pre-Session Survey' AND upchieve.subjects.name = 'integratedMathOne') OR
 (upchieve.surveys.name = 'STEM Pre-Session Survey' AND upchieve.subjects.name = 'integratedMathTwo') OR
 (upchieve.surveys.name = 'STEM Pre-Session Survey' AND upchieve.subjects.name = 'integratedMathThree') OR
 (upchieve.surveys.name = 'STEM Pre-Session Survey' AND upchieve.subjects.name = 'integratedMathFour') OR
 (upchieve.surveys.name = 'Humanities Essays Pre-Session Survey' AND upchieve.subjects.name = 'humanitiesEssays') OR
 (upchieve.surveys.name = 'Reading Pre-Session Survey' AND upchieve.subjects.name = 'reading') OR
 (upchieve.surveys.name = 'College Planning Pre-Session Survey' AND upchieve.subjects.name = 'planning') OR
 (upchieve.surveys.name = 'College Applications Pre-Session Survey' AND upchieve.subjects.name = 'applications') OR
 (upchieve.surveys.name = 'SAT Prep Pre-Session Survey' AND upchieve.subjects.name = 'satMath') OR
 (upchieve.surveys.name = 'SAT Prep Pre-Session Survey' AND upchieve.subjects.name = 'satReading');
 */
INSERT INTO upchieve.question_types (name, created_at, updated_at)
    VALUES ('multiple choice', NOW(), NOW()), ('check box', NOW(), NOW()), ('free response', NOW(), NOW());

INSERT INTO upchieve.survey_questions (question_type_id, question_text, created_at, updated_at)
SELECT
    upchieve.question_types.id,
    sub.text,
    NOW(),
    NOW()
FROM
    upchieve.question_types
    JOIN UNNEST(ARRAY['What is your primary goal for today''s session?', 'Where are you in the process of reaching your goal?', 'How do you feel about your ability to get accepted to college?', 'Where are you in the process of learning this specific topic?', 'How do you feel about your ability to learn this topic?']) AS sub ON TRUE
WHERE
    upchieve.question_types.name = 'multiple choice';

INSERT INTO upchieve.survey_response_choices (score, choice_text, created_at, updated_at)
    VALUES (0, 'Solve a specific question', NOW(), NOW()), (0, 'Complete a homework assignment', NOW(), NOW()), (0, 'Prepare for a quiz/test', NOW(), NOW()), (0, 'Check my answers', NOW(), NOW()), (0, 'Improve my understanding of a topic', NOW(), NOW()), (0, 'Other', NOW(), NOW()), (0, 'Brainstorm or research an essay topic', NOW(), NOW()), (0, 'Develop a thesis statement', NOW(), NOW()), (0, 'Create an essay outline', NOW(), NOW()), (0, 'Revise essay structure and ideas', NOW(), NOW()), (0, 'Edit grammar', NOW(), NOW()), (0, 'Improve my understanding of a text', NOW(), NOW()), (0, 'Answer questions based on a text', NOW(), NOW()), (0, 'Revise my response(s) to reading questions', NOW(), NOW()), (0, 'Understand college requirements', NOW(), NOW()), (0, 'Pick classes or extracurricular activities', NOW(), NOW()), (0, 'Research majors or careers', NOW(), NOW()), (0, 'Select colleges to apply to', NOW(), NOW()), (0, 'Learn about financial aid and scholarships', NOW(), NOW()), (0, 'Select a prompt and brainstorm topics', NOW(), NOW()), (0, 'Create an outline', NOW(), NOW()), (0, 'Understand the parts of an application', NOW(), NOW()), (0, 'Create an application timeline', NOW(), NOW()), (0, 'Work on an application', NOW(), NOW()), (0, 'Prepare for an interview', NOW(), NOW()), (0, 'Complete financial aid applications', NOW(), NOW()), (0, 'Learn more about the exam', NOW(), NOW()), (0, 'Work on a practice question(s)', NOW(), NOW()), (0, 'Learn test taking strategies', NOW(), NOW()), (0, 'Improve my understanding of a concept', NOW(), NOW()), (1, 'I haven''t started on this yet', NOW(), NOW()), (2, 'I''ve done some work on this', NOW(), NOW()), (3, 'I''m finishing this up ', NOW(), NOW()), (4, 'I''ve completed this ', NOW(), NOW()), (1, '😭', NOW(), NOW()), (2, '😟', NOW(), NOW()), (3, '🙂', NOW(), NOW()), (4, '😀', NOW(), NOW()), (1, 'I don''t know how to do it yet', NOW(), NOW()), (2, 'I am beginning to understand this, but I need some help', NOW(), NOW()), (3, 'I understand this and can do it by myself', NOW(), NOW()), (4, 'I understand this so well that I can help my friends do it', NOW(), NOW());

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
WHERE (upchieve.surveys.name = 'STEM Pre-Session Survey'
    AND upchieve.survey_questions.question_text = 'What is your primary goal for today''s session?'
    AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'Humanities Essays Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'What is your primary goal for today''s session?'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'Reading Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'What is your primary goal for today''s session?'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'College Planning Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'What is your primary goal for today''s session?'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'SAT Prep Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'What is your primary goal for today''s session?'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'STEM Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'Where are you in the process of learning this specific topic?'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'Humanities Essays Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'Where are you in the process of learning this specific topic?'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'Reading Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'Where are you in the process of learning this specific topic?'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'SAT Prep Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'Where are you in the process of learning this specific topic?'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'STEM Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'How do you feel about your ability to learn this topic?'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'Humanities Essays Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'How do you feel about your ability to learn this topic?'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'Reading Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'How do you feel about your ability to learn this topic?'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'SAT Prep Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'How do you feel about your ability to learn this topic?'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'College Planning Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'What is your primary goal for today''s session?'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'College Essays Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'What is your primary goal for today''s session?'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'College Applications Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'What is your primary goal for today''s session?'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'College Planning Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'Where are you in the process of reaching your goal?'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'College Essays Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'Where are you in the process of reaching your goal?'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'College Applications Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'Where are you in the process of reaching your goal?'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'College Planning Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'How do you feel about your ability to get accepted to college?'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'College Essays Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'How do you feel about your ability to get accepted to college?'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'College Applications Pre-Session Survey'
        AND upchieve.survey_questions.question_text = 'How do you feel about your ability to get accepted to college?'
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
WHERE (upchieve.surveys.name = 'STEM Pre-Session Survey'
    AND sq.question_text = 'What is your primary goal for today''s session?'
    AND rc.choice_text = 'Solve a specific question'
    AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'STEM Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Complete a homework assignment'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'STEM Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Prepare for a quiz/test'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'STEM Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Check my answers'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'STEM Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Improve my understanding of a topic'
        AND sub.text::int = 50)
    OR (upchieve.surveys.name = 'STEM Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Other'
        AND sub.text::int = 60)
    OR (upchieve.surveys.name = 'Humanities Essays Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Brainstorm or research an essay topic'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'Humanities Essays Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Develop a thesis statement'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'Humanities Essays Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Create an essay outline'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'Humanities Essays Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Revise essay structure and ideas'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'Humanities Essays Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Edit grammar'
        AND sub.text::int = 50)
    OR (upchieve.surveys.name = 'Humanities Essays Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Other'
        AND sub.text::int = 60)
    OR (upchieve.surveys.name = 'Reading Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Improve my understanding of a text'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'Reading Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Answer questions based on a text'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'Reading Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Revise my response(s) to reading questions'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'Reading Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Other'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'College Planning Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Understand college requirements'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'College Planning Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Pick classes or extracurricular activities'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'College Planning Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Research majors or careers'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'College Planning Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Select colleges to apply to'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'College Planning Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Learn about financial aid and scholarships'
        AND sub.text::int = 50)
    OR (upchieve.surveys.name = 'College Planning Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Other'
        AND sub.text::int = 60)
    OR (upchieve.surveys.name = 'College Essays Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Select a prompt and brainstorm topics'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'College Essays Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Create an outline'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'College Essays Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Revise essay structure and ideas'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'College Essays Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Edit grammar'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'College Essays Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Other'
        AND sub.text::int = 50)
    OR (upchieve.surveys.name = 'College Applications Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Understand the parts of an application'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'College Applications Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Create an application timeline'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'College Applications Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Work on an application'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'College Applications Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Prepare for an interview'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'College Applications Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Complete financial aid applications'
        AND sub.text::int = 50)
    OR (upchieve.surveys.name = 'College Applications Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Other'
        AND sub.text::int = 60)
    OR (upchieve.surveys.name = 'SAT Prep Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Learn more about the exam'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'SAT Prep Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Learn test taking strategies'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'SAT Prep Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Work on a practice question(s)'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'SAT Prep Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Check my answers'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'SAT Prep Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Improve my understanding of a concept'
        AND sub.text::int = 50)
    OR (upchieve.surveys.name = 'SAT Prep Pre-Session Survey'
        AND sq.question_text = 'What is your primary goal for today''s session?'
        AND rc.choice_text = 'Other'
        AND sub.text::int = 60)
    OR (upchieve.surveys.name = 'STEM Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of learning this specific topic?'
        AND rc.choice_text = 'I don''t know how to do it yet'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'Humanities Essays Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of learning this specific topic?'
        AND rc.choice_text = 'I don''t know how to do it yet'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'Reading Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of learning this specific topic?'
        AND rc.choice_text = 'I don''t know how to do it yet'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'SAT Prep Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of learning this specific topic?'
        AND rc.choice_text = 'I don''t know how to do it yet'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'STEM Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of learning this specific topic?'
        AND rc.choice_text = 'I am beginning to understand this, but I need some help'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'Humanities Essays Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of learning this specific topic?'
        AND rc.choice_text = 'I am beginning to understand this, but I need some help'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'Reading Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of learning this specific topic?'
        AND rc.choice_text = 'I am beginning to understand this, but I need some help'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'SAT Prep Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of learning this specific topic?'
        AND rc.choice_text = 'I am beginning to understand this, but I need some help'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'STEM Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of learning this specific topic?'
        AND rc.choice_text = 'I understand this and can do it by myself'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'Humanities Essays Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of learning this specific topic?'
        AND rc.choice_text = 'I understand this and can do it by myself'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'Reading Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of learning this specific topic?'
        AND rc.choice_text = 'I understand this and can do it by myself'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'SAT Prep Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of learning this specific topic?'
        AND rc.choice_text = 'I understand this and can do it by myself'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'STEM Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of learning this specific topic?'
        AND rc.choice_text = 'I understand this so well that I can help my friends do it'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'Humanities Essays Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of learning this specific topic?'
        AND rc.choice_text = 'I understand this so well that I can help my friends do it'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'Reading Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of learning this specific topic?'
        AND rc.choice_text = 'I understand this so well that I can help my friends do it'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'SAT Prep Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of learning this specific topic?'
        AND rc.choice_text = 'I understand this so well that I can help my friends do it'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'STEM Pre-Session Survey'
        AND sq.question_text = 'How do you feel about your ability to learn this topic?'
        AND rc.choice_text = '😭'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'Humanities Essays Pre-Session Survey'
        AND sq.question_text = 'How do you feel about your ability to learn this topic?'
        AND rc.choice_text = '😭'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'Reading Pre-Session Survey'
        AND sq.question_text = 'How do you feel about your ability to learn this topic?'
        AND rc.choice_text = '😭'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'SAT Prep Pre-Session Survey'
        AND sq.question_text = 'How do you feel about your ability to learn this topic?'
        AND rc.choice_text = '😭'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'STEM Pre-Session Survey'
        AND sq.question_text = 'How do you feel about your ability to learn this topic?'
        AND rc.choice_text = '😟'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'Humanities Essays Pre-Session Survey'
        AND sq.question_text = 'How do you feel about your ability to learn this topic?'
        AND rc.choice_text = '😟'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'Reading Pre-Session Survey'
        AND sq.question_text = 'How do you feel about your ability to learn this topic?'
        AND rc.choice_text = '😟'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'SAT Prep Pre-Session Survey'
        AND sq.question_text = 'How do you feel about your ability to learn this topic?'
        AND rc.choice_text = '😟'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'STEM Pre-Session Survey'
        AND sq.question_text = 'How do you feel about your ability to learn this topic?'
        AND rc.choice_text = '🙂'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'Humanities Essays Pre-Session Survey'
        AND sq.question_text = 'How do you feel about your ability to learn this topic?'
        AND rc.choice_text = '🙂'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'Reading Pre-Session Survey'
        AND sq.question_text = 'How do you feel about your ability to learn this topic?'
        AND rc.choice_text = '🙂'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'SAT Prep Pre-Session Survey'
        AND sq.question_text = 'How do you feel about your ability to learn this topic?'
        AND rc.choice_text = '🙂'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'STEM Pre-Session Survey'
        AND sq.question_text = 'How do you feel about your ability to learn this topic?'
        AND rc.choice_text = '😀'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'Humanities Essays Pre-Session Survey'
        AND sq.question_text = 'How do you feel about your ability to learn this topic?'
        AND rc.choice_text = '😀'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'Reading Pre-Session Survey'
        AND sq.question_text = 'How do you feel about your ability to learn this topic?'
        AND rc.choice_text = '😀'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'SAT Prep Pre-Session Survey'
        AND sq.question_text = 'How do you feel about your ability to learn this topic?'
        AND rc.choice_text = '😀'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'College Planning Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of reaching your goal?'
        AND rc.choice_text = 'I haven''t started on this yet'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'College Essays Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of reaching your goal?'
        AND rc.choice_text = 'I haven''t started on this yet'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'College Applications Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of reaching your goal?'
        AND rc.choice_text = 'I haven''t started on this yet'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'College Planning Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of reaching your goal?'
        AND rc.choice_text = 'I''ve done some work on this '
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'College Essays Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of reaching your goal?'
        AND rc.choice_text = 'I''ve done some work on this '
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'College Applications Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of reaching your goal?'
        AND rc.choice_text = 'I''ve done some work on this '
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'College Planning Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of reaching your goal?'
        AND rc.choice_text = 'I''m finishing this up '
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'College Essays Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of reaching your goal?'
        AND rc.choice_text = 'I''m finishing this up '
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'College Applications Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of reaching your goal?'
        AND rc.choice_text = 'I''m finishing this up '
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'College Planning Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of reaching your goal?'
        AND rc.choice_text = 'I''ve completed this'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'College Essays Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of reaching your goal?'
        AND rc.choice_text = 'I''ve completed this'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'College Applications Pre-Session Survey'
        AND sq.question_text = 'Where are you in the process of reaching your goal?'
        AND rc.choice_text = 'I''ve completed this'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'College Planning Pre-Session Survey'
        AND sq.question_text = 'How do you feel about your ability to get accepted to college?'
        AND rc.choice_text = '😭'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'College Essays Pre-Session Survey'
        AND sq.question_text = 'How do you feel about your ability to get accepted to college?'
        AND rc.choice_text = '😭'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'College Applications Pre-Session Survey'
        AND sq.question_text = 'How do you feel about your ability to get accepted to college?'
        AND rc.choice_text = '😭'
        AND sub.text::int = 10)
    OR (upchieve.surveys.name = 'College Planning Pre-Session Survey'
        AND sq.question_text = 'How do you feel about your ability to get accepted to college?'
        AND rc.choice_text = '😟'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'College Essays Pre-Session Survey'
        AND sq.question_text = 'How do you feel about your ability to get accepted to college?'
        AND rc.choice_text = '😟'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'College Applications Pre-Session Survey'
        AND sq.question_text = 'How do you feel about your ability to get accepted to college?'
        AND rc.choice_text = '😟'
        AND sub.text::int = 20)
    OR (upchieve.surveys.name = 'College Planning Pre-Session Survey'
        AND sq.question_text = 'How do you feel about your ability to get accepted to college?'
        AND rc.choice_text = '🙂'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'College Essays Pre-Session Survey'
        AND sq.question_text = 'How do you feel about your ability to get accepted to college?'
        AND rc.choice_text = '🙂'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'College Applications Pre-Session Survey'
        AND sq.question_text = 'How do you feel about your ability to get accepted to college?'
        AND rc.choice_text = '🙂'
        AND sub.text::int = 30)
    OR (upchieve.surveys.name = 'College Planning Pre-Session Survey'
        AND sq.question_text = 'How do you feel about your ability to get accepted to college?'
        AND rc.choice_text = '😀'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'College Essays Pre-Session Survey'
        AND sq.question_text = 'How do you feel about your ability to get accepted to college?'
        AND rc.choice_text = '😀'
        AND sub.text::int = 40)
    OR (upchieve.surveys.name = 'College Applications Pre-Session Survey'
        AND sq.question_text = 'How do you feel about your ability to get accepted to college?'
        AND rc.choice_text = '😀'
        AND sub.text::int = 40);

-- migrate:down
DELETE FROM upchieve.surveys_context CASCADE;

DELETE FROM upchieve.survey_questions_response_choices CASCADE;

DELETE FROM upchieve.surveys_survey_questions CASCADE;

DELETE FROM upchieve.survey_response_choices CASCADE;

DELETE FROM upchieve.survey_questions CASCADE;

DELETE FROM upchieve.question_types CASCADE;

DELETE FROM upchieve.surveys CASCADE;

-- NOTE: this down migration does not work quite right (the CASCADEs don't work as intended, if there is data relying
--  foreign keys that would be deleted in this migration it simply fails); there is ongoing discussion on how to handle this right

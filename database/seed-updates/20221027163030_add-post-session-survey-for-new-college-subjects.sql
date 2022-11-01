-- migrate:up
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
WHERE (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
    AND upchieve.subjects.name = 'collegePrep'
    AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
        AND upchieve.subjects.name = 'collegeList'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
        AND upchieve.subjects.name = 'collegeApps'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
        AND upchieve.subjects.name = 'applicationEssays'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
        AND upchieve.subjects.name = 'financialAid'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND upchieve.subjects.name = 'collegePrep'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND upchieve.subjects.name = 'collegeList'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND upchieve.subjects.name = 'collegeApps'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND upchieve.subjects.name = 'applicationEssays'
        AND upchieve.survey_types.name = 'postsession')
    OR (upchieve.surveys.name = 'Student Post-Session Survey'
        AND upchieve.subjects.name = 'financialAid'
        AND upchieve.survey_types.name = 'postsession');

-- migrate:down
DELETE FROM upchieve.surveys_context USING upchieve.surveys, upchieve.subjects
WHERE upchieve.surveys_context.survey_id = upchieve.surveys.id
    AND upchieve.surveys_context.subject_id = upchieve.subjects.id
    AND (upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey'
        OR upchieve.surveys.name = 'Student Post-Session Survey')
    AND (upchieve.subjects.name = 'collegePrep'
        OR upchieve.subjects.name = 'collegeList'
        OR upchieve.subjects.name = 'collegeApps'
        OR upchieve.subjects.name = 'applicationEssays'
        OR upchieve.subjects.name = 'financialAid');


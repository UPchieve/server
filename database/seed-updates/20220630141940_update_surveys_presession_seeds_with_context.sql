-- migrate:up
INSERT INTO upchieve.survey_types (name, created_at, updated_at)
    VALUES ('presession', NOW(), NOW()), ('postsession', NOW(), NOW())
ON CONFLICT ON CONSTRAINT survey_types_name_key
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
WHERE (upchieve.surveys.name = 'STEM Pre-Session Survey'
    AND upchieve.subjects.name = 'prealgebra'
    AND upchieve.survey_types.name = 'presession')
    OR (upchieve.surveys.name = 'STEM Pre-Session Survey'
        AND upchieve.subjects.name = 'algebraOne'
        AND upchieve.survey_types.name = 'presession')
    OR (upchieve.surveys.name = 'STEM Pre-Session Survey'
        AND upchieve.subjects.name = 'algebraTwo'
        AND upchieve.survey_types.name = 'presession')
    OR (upchieve.surveys.name = 'STEM Pre-Session Survey'
        AND upchieve.subjects.name = 'geometry'
        AND upchieve.survey_types.name = 'presession')
    OR (upchieve.surveys.name = 'STEM Pre-Session Survey'
        AND upchieve.subjects.name = 'trigonometry'
        AND upchieve.survey_types.name = 'presession')
    OR (upchieve.surveys.name = 'STEM Pre-Session Survey'
        AND upchieve.subjects.name = 'precalculus'
        AND upchieve.survey_types.name = 'presession')
    OR (upchieve.surveys.name = 'STEM Pre-Session Survey'
        AND upchieve.subjects.name = 'calculusAB'
        AND upchieve.survey_types.name = 'presession')
    OR (upchieve.surveys.name = 'STEM Pre-Session Survey'
        AND upchieve.subjects.name = 'calculusBC'
        AND upchieve.survey_types.name = 'presession')
    OR (upchieve.surveys.name = 'STEM Pre-Session Survey'
        AND upchieve.subjects.name = 'statistics'
        AND upchieve.survey_types.name = 'presession')
    OR (upchieve.surveys.name = 'STEM Pre-Session Survey'
        AND upchieve.subjects.name = 'biology'
        AND upchieve.survey_types.name = 'presession')
    OR (upchieve.surveys.name = 'STEM Pre-Session Survey'
        AND upchieve.subjects.name = 'chemistry'
        AND upchieve.survey_types.name = 'presession')
    OR (upchieve.surveys.name = 'STEM Pre-Session Survey'
        AND upchieve.subjects.name = 'physicsOne'
        AND upchieve.survey_types.name = 'presession')
    OR (upchieve.surveys.name = 'STEM Pre-Session Survey'
        AND upchieve.subjects.name = 'physicsTwo'
        AND upchieve.survey_types.name = 'presession')
    OR (upchieve.surveys.name = 'STEM Pre-Session Survey'
        AND upchieve.subjects.name = 'environmentalScience'
        AND upchieve.survey_types.name = 'presession')
    OR (upchieve.surveys.name = 'STEM Pre-Session Survey'
        AND upchieve.subjects.name = 'integratedMathOne'
        AND upchieve.survey_types.name = 'presession')
    OR (upchieve.surveys.name = 'STEM Pre-Session Survey'
        AND upchieve.subjects.name = 'integratedMathTwo'
        AND upchieve.survey_types.name = 'presession')
    OR (upchieve.surveys.name = 'STEM Pre-Session Survey'
        AND upchieve.subjects.name = 'integratedMathThree'
        AND upchieve.survey_types.name = 'presession')
    OR (upchieve.surveys.name = 'STEM Pre-Session Survey'
        AND upchieve.subjects.name = 'integratedMathFour'
        AND upchieve.survey_types.name = 'presession')
    OR (upchieve.surveys.name = 'Humanities Essays Pre-Session Survey'
        AND upchieve.subjects.name = 'humanitiesEssays'
        AND upchieve.survey_types.name = 'presession')
    OR (upchieve.surveys.name = 'Reading Pre-Session Survey'
        AND upchieve.subjects.name = 'reading'
        AND upchieve.survey_types.name = 'presession')
    OR (upchieve.surveys.name = 'College Planning Pre-Session Survey'
        AND upchieve.subjects.name = 'planning'
        AND upchieve.survey_types.name = 'presession')
    OR (upchieve.surveys.name = 'College Applications Pre-Session Survey'
        AND upchieve.subjects.name = 'applications'
        AND upchieve.survey_types.name = 'presession')
    OR (upchieve.surveys.name = 'SAT Prep Pre-Session Survey'
        AND upchieve.subjects.name = 'satMath'
        AND upchieve.survey_types.name = 'presession')
    OR (upchieve.surveys.name = 'SAT Prep Pre-Session Survey'
        AND upchieve.subjects.name = 'satReading'
        AND upchieve.survey_types.name = 'presession');

-- migrate:down
DELETE FROM upchieve.surveys_context CASCADE;

DELETE FROM upchieve.survey_types CASCADE;


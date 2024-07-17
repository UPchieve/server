-- migrate:up
UPDATE
    upchieve.surveys
SET
    role_id = 1,
    updated_at = NOW()
WHERE
    upchieve.surveys.name = 'STEM Pre-Session Survey'
    OR upchieve.surveys.name = 'Humanities Essays Pre-Session Survey'
    OR upchieve.surveys.name = 'Reading Pre-Session Survey'
    OR upchieve.surveys.name = 'College Planning Pre-Session Survey'
    OR upchieve.surveys.name = 'College Essays Pre-Session Survey'
    OR upchieve.surveys.name = 'College Applications Pre-Session Survey'
    OR upchieve.surveys.name = 'SAT Prep Pre-Session Survey'
    OR upchieve.surveys.name = 'Student Post-Session Survey'
    OR upchieve.surveys.name = 'U.S. History Pre-Session Survey';

UPDATE
    upchieve.surveys
SET
    role_id = 2,
    updated_at = NOW()
WHERE
    upchieve.surveys.name = 'General Volunteer Post-Session Survey'
    OR upchieve.surveys.name = 'SAT Prep Volunteer Post-Session Survey'
    OR upchieve.surveys.name = 'College Counseling Volunteer Post-Session Survey';

-- migrate:down
UPDATE
    upchieve.surveys
SET
    role_id = NULL,
    updated_at = NOW();


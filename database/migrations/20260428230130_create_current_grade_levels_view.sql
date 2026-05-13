-- migrate:up
CREATE VIEW upchieve.current_grade_levels AS
WITH grade_progression AS (
    SELECT
        ugl.user_id,
        ugl.grade_level_id,
        GREATEST (0, EXTRACT(YEAR FROM (CURRENT_DATE - INTERVAL '6 months'))::int - EXTRACT(YEAR FROM (ugl.updated_at::date - INTERVAL '6 months'))::int) AS school_years_passed
    FROM
        upchieve.users_grade_levels ugl
)
SELECT
    grade_progression.user_id,
    CASE upchieve.grade_levels.name
    WHEN 'Other' THEN
        'Other'
    ELSE
        (ARRAY['6th', '7th', '8th', '9th', '10th', '11th', '12th', 'College'])[LEAST (ARRAY_POSITION(ARRAY['6th', '7th', '8th', '9th', '10th', '11th', '12th', 'College'], upchieve.grade_levels.name) + grade_progression.school_years_passed, 8)]
    END AS current_grade_name
FROM
    grade_progression
    JOIN upchieve.grade_levels ON grade_progression.grade_level_id = upchieve.grade_levels.id;

-- migrate:down
DROP VIEW upchieve.current_grade_levels;


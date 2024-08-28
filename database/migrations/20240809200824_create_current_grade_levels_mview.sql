-- migrate:up
CREATE TABLE upchieve.grade_level_sequence (
    grade_name text PRIMARY KEY,
    next_grade_name text
);

CREATE OR REPLACE FUNCTION upchieve.get_next_grade_name (current_grade_name text, school_years_passed int)
    RETURNS text
    AS $$
DECLARE
    next_grade text := current_grade_name;
BEGIN
    FOR i IN 1..school_years_passed LOOP
        SELECT
            next_grade_name INTO next_grade
        FROM
            upchieve.grade_level_sequence
        WHERE
            grade_name = next_grade;
    END LOOP;
    RETURN next_grade;
END;
$$
LANGUAGE plpgsql;

CREATE MATERIALIZED VIEW upchieve.current_grade_levels_mview AS
WITH base_dates AS (
    SELECT
        upchieve.student_profiles.user_id,
        upchieve.student_profiles.grade_level_id,
        -- Use migration date if user signed up before August 30th, 2023 (2023-08-30T17:46:00Z), otherwise use sign-up date
        CASE WHEN upchieve.student_profiles.created_at < '2023-08-30T17:46:00Z'::date THEN
            '2023-08-30T17:46:00Z'::date
        ELSE
            upchieve.student_profiles.created_at
        END AS base_date
    FROM
        upchieve.student_profiles
),
grade_progression AS (
    SELECT
        base_dates.user_id,
        base_dates.grade_level_id,
        base_dates.base_date,
        -- Calculate the number of school years passed since the base date
        CASE
        -- If the user signed up after July 1st of the current year, they should not be moved up until the next school year
        WHEN base_dates.base_date >= date_trunc('year', CURRENT_DATE) + INTERVAL '6 months' THEN
            0
        ELSE
            -- Get numbers of school years elapsed since base_date (initial grade migration or sign up date)
            (EXTRACT(YEAR FROM age(CURRENT_DATE, base_dates.base_date)) + CASE
                -- Increment by 1 if current date is after July 1st
                WHEN CURRENT_DATE >= date_trunc('year', CURRENT_DATE) + INTERVAL '6 months' THEN
                    1
                ELSE
                    0
                END)
        END::int AS school_years_passed
    FROM
        base_dates
)
SELECT
    grade_progression.user_id,
    grade_progression.grade_level_id AS initial_grade_level_id,
    upchieve.grade_levels.name AS initial_grade_name,
    -- Calculate the new grade level name based on the number of school years passed
    upchieve.get_next_grade_name (upchieve.grade_levels.name, grade_progression.school_years_passed) AS current_grade_name
FROM
    grade_progression
    JOIN upchieve.grade_levels ON grade_progression.grade_level_id = upchieve.grade_levels.id;

-- migrate:down
DROP MATERIALIZED VIEW IF EXISTS upchieve.current_grade_levels_mview;

DROP FUNCTION IF EXISTS upchieve.get_next_grade_name;

DROP TABLE IF EXISTS upchieve.grade_level_sequence;


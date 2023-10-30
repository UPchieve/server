-- migrate:up
-- A permanent table with our backup data which will get dropped in either the UP or DOWN script.
CREATE TABLE IF NOT EXISTS student_favorite_volunteers_backup AS
SELECT
    *
FROM
    upchieve.student_favorite_volunteers;

BEGIN TRANSACTION;
-- Select the row with max updated_at for each unique (student_id, volunteer_id) combination from student_favorite_coaches.
-- Then store these in a new table, unique_favorites.
WITH favorites_partition AS (
    SELECT
        student_id,
        volunteer_id,
        updated_at,
        created_at,
        ROW_NUMBER() OVER (PARTITION BY student_id,
            volunteer_id ORDER BY updated_at DESC) AS rn
    FROM
        upchieve.student_favorite_volunteers
)
SELECT
    student_id,
    volunteer_id,
    updated_at,
    created_at INTO TEMPORARY unique_favorites_temp
FROM
    favorites_partition
WHERE
    rn = 1;
-- Dump the contents of the table so we can add a unique constraint safely
DELETE FROM upchieve.student_favorite_volunteers;
ALTER TABLE IF EXISTS upchieve.student_favorite_volunteers
    ADD CONSTRAINT unique_student_id_volunteer_id UNIQUE (student_id, volunteer_id);
-- Repopulate the table with the unique rows
INSERT INTO upchieve.student_favorite_volunteers
SELECT
    *
FROM
    unique_favorites_temp;
COMMIT;

DROP TABLE IF EXISTS student_favorite_volunteers_backup;

-- migrate:down
ALTER TABLE IF EXISTS upchieve.student_favorite_volunteers
    DROP CONSTRAINT IF EXISTS unique_student_id_volunteer_id;

INSERT INTO upchieve.student_favorite_volunteers
SELECT
    *
FROM
    student_favorite_volunteers_backup
WHERE (student_id, volunteer_id, created_at, updated_at)
NOT IN (
    SELECT
        *
    FROM
        upchieve.student_favorite_volunteers);

DROP TABLE IF EXISTS student_favorite_volunteers_backup;


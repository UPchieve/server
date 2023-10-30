-- migrate:up
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
-- Grab only the row that has the most recent updated_at for each (student_id, volunteer_id) combination
-- Now dump the contents of the old table and repopulate it with the contents of the temp table.
DELETE FROM upchieve.student_favorite_volunteers;
INSERT INTO upchieve.student_favorite_volunteers
SELECT
    *
FROM
    unique_favorites_temp;
-- Now that duplicates have been removed, add the UNIQUE constraint
ALTER TABLE IF EXISTS upchieve.student_favorite_volunteers
    ADD CONSTRAINT unique_student_id_volunteer_id UNIQUE (student_id, volunteer_id);
DROP TABLE IF EXISTS student_favorite_volunteers_backup;
COMMIT;

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


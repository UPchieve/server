-- migrate:up
CREATE MATERIALIZED VIEW IF NOT EXISTS upchieve.users_subjects_mview AS
WITH subject_totals AS (
    SELECT
        upchieve.subjects.name,
        COUNT(*)::int AS total
    FROM
        upchieve.certification_subject_unlocks
        JOIN upchieve.subjects ON upchieve.subjects.id = upchieve.certification_subject_unlocks.subject_id
    GROUP BY
        upchieve.subjects.name
)
SELECT
    upchieve.users.id,
    subjects_unlocked.subject
FROM
    upchieve.users
    JOIN upchieve.volunteer_profiles vp ON vp.user_id = upchieve.users.id
    LEFT JOIN (
        SELECT
            user_id,
            sub_unlocked.subject AS subject
        FROM (
            SELECT
                user_id,
                upchieve.subjects.name AS subject
            FROM
                upchieve.users_certifications
                JOIN upchieve.certification_subject_unlocks USING (certification_id)
                JOIN upchieve.subjects ON upchieve.certification_subject_unlocks.subject_id = upchieve.subjects.id
                JOIN subject_totals ON subject_totals.name = upchieve.subjects.name
            GROUP BY
                user_id, upchieve.subjects.name, subject_totals.total
            HAVING
                COUNT(*)::int >= subject_totals.total) AS sub_unlocked
        GROUP BY
            user_id,
            subject) AS subjects_unlocked ON subjects_unlocked.user_id = upchieve.users.id
WHERE
    subjects_unlocked IS NOT NULL;

CREATE OR REPLACE FUNCTION upchieve.refresh_users_subjects_mview ()
    RETURNS TRIGGER
    LANGUAGE PLPGSQL
    AS $$
BEGIN
    REFRESH MATERIALIZED VIEW upchieve.users_subjects_mview;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_users_certifications_change AFTER UPDATE
    OR INSERT
    OR DELETE ON upchieve.users_certifications FOR EACH ROW EXECUTE PROCEDURE upchieve.refresh_users_subjects_mview ();

-- migrate:down
DROP TRIGGER IF EXISTS on_users_certifications_change ON upchieve.users_certifications;

DROP FUNCTION IF EXISTS upchieve.refresh_users_subjects_mview;

DROP MATERIALIZED VIEW IF EXISTS upchieve.users_subjects_mview;


-- migrate:up
DROP TRIGGER IF EXISTS update_users_subjects ON upchieve.users_certifications;

DROP FUNCTION IF EXISTS upchieve.refresh_users_subjects_mview;

DROP MATERIALIZED VIEW IF EXISTS upchieve.users_subjects_mview;

DROP TRIGGER update_users_unlocked_subjects ON upchieve.users_certifications;

DROP FUNCTION upchieve.refresh_users_subjects_unlocked_mview;

DROP MATERIALIZED VIEW upchieve.users_unlocked_subjects_mview;

-- migrate:down
CREATE MATERIALIZED VIEW IF NOT EXISTS upchieve.users_subjects_mview AS
WITH subject_totals AS (
    SELECT
        upchieve.subjects.id,
        COUNT(*)::int AS total
    FROM
        upchieve.certification_subject_unlocks
        JOIN upchieve.subjects ON upchieve.subjects.id = upchieve.certification_subject_unlocks.subject_id
    GROUP BY
        upchieve.subjects.id
)
SELECT
    upchieve.users.id AS user_id,
    subjects_unlocked.subject_id
FROM
    upchieve.users
    JOIN upchieve.volunteer_profiles vp ON vp.user_id = upchieve.users.id
    LEFT JOIN (
        SELECT
            user_id,
            sub_unlocked.subject AS subject_id
        FROM (
            SELECT
                user_id,
                upchieve.subjects.id AS subject
            FROM
            -- The end result of these joins is `certifications` attached to which subject they help unlock (will duplicate some certs which can be used to unlock multiple subjects)
            upchieve.users_certifications
            JOIN upchieve.certification_subject_unlocks USING (certification_id)
            JOIN upchieve.subjects ON upchieve.certification_subject_unlocks.subject_id = upchieve.subjects.id
            JOIN subject_totals ON subject_totals.id = upchieve.subjects.id
        GROUP BY
            -- bucket the result for each user by subject id (in this case the subject the cert is contributing to unlocking)
            user_id, upchieve.subjects.id, subject_totals.total
        HAVING
            -- in each subject bucket check that the user has earned the same number of certs that contribute to unlocking the subject as the total we calculated initially in the CTE
            COUNT(*)::int >= subject_totals.total) AS sub_unlocked
        -- the output of the inner most query is one row per user per subject with columns for the user id and subject id so this outer query is kind of unnecessary but in the original example query given we array_agg subject names per user for a human readable output
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

CREATE OR REPLACE TRIGGER update_users_subjects AFTER UPDATE
    OR INSERT
    OR DELETE ON upchieve.users_certifications FOR EACH ROW EXECUTE PROCEDURE upchieve.refresh_users_subjects_mview ();

CREATE MATERIALIZED VIEW upchieve.users_unlocked_subjects_mview AS
WITH certifications_by_user AS (
    SELECT
        user_id,
        array_agg(DISTINCT certification_id) AS certification_ids
    FROM
        upchieve.users_certifications
    GROUP BY
        user_id
),
direct_subject_unlocks AS (
    SELECT
        uc.user_id,
        csu.subject_id
    FROM
        upchieve.users_certifications uc
        JOIN upchieve.certification_subject_unlocks csu ON csu.certification_id = uc.certification_id
),
computed_unlocks AS (
    SELECT
        cbu.user_id,
        comp_su.subject_id
    FROM
        certifications_by_user cbu
        JOIN (
            SELECT
                subject_id,
                array_agg(DISTINCT certification_id) AS required_certs
            FROM
                upchieve.computed_subject_unlocks csu
            GROUP BY
                subject_id) comp_su ON cbu.certification_ids @> comp_su.required_certs)
    -- Now combine and deduplicate
    SELECT
        all_unlocks.user_id AS user_id,
        array_agg(DISTINCT s.name) AS unlocked_subjects
FROM (
    SELECT
        *
    FROM
        direct_subject_unlocks
    UNION ALL
    SELECT
        *
    FROM
        computed_unlocks) AS all_unlocks
    JOIN upchieve.subjects s ON s.id = all_unlocks.subject_id
GROUP BY
    all_unlocks.user_id;

CREATE FUNCTION upchieve.refresh_users_subjects_unlocked_mview ()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    AS $$
BEGIN
    REFRESH MATERIALIZED VIEW upchieve.users_unlocked_subjects_mview;
    RETURN new;
END;
$$;

CREATE TRIGGER update_users_unlocked_subjects
    AFTER UPDATE OR INSERT OR DELETE ON upchieve.users_certifications
    FOR EACH ROW
    EXECUTE PROCEDURE upchieve.refresh_users_subjects_unlocked_mview ();

ALTER MATERIALIZED VIEW upchieve.users_subjects_mview OWNER TO mat_view_owners;

ALTER MATERIALIZED VIEW upchieve.users_unlocked_subjects_mview OWNER TO mat_view_owners;


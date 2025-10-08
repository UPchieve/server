-- migrate:up
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

-- migrate:down
DROP TRIGGER update_users_unlocked_subjects ON upchieve.users_certifications;

DROP FUNCTION upchieve.refresh_users_subjects_unlocked_mview;

DROP MATERIALIZED VIEW upchieve.users_unlocked_subjects_mview;


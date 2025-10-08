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
        u.id AS user_id,
        s.id AS subject_id
    FROM
        upchieve.users u
        JOIN upchieve.users_certifications uc ON uc.user_id = u.id
        JOIN upchieve.certification_subject_unlocks csu ON csu.certification_id = uc.certification_id
        JOIN upchieve.subjects s ON s.id = csu.subject_id
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
                subject_id) comp_su ON TRUE
        WHERE
            NOT EXISTS (
                SELECT
                    1
                FROM
                    unnest(comp_su.required_certs) AS req_cert
                WHERE
                    req_cert NOT IN (
                        SELECT
                            unnest(cbu.certification_ids))))
            -- Now combine and deduplicate
            SELECT
                u.id AS user_id,
                array_agg(DISTINCT s.name) AS unlocked_subjects
FROM
    upchieve.users u
    LEFT JOIN (
        SELECT
            *
        FROM
            direct_subject_unlocks
    UNION ALL
    SELECT
        *
    FROM
        computed_unlocks) all_unlocks ON all_unlocks.user_id = u.id
    JOIN upchieve.subjects s ON s.id = all_unlocks.subject_id
GROUP BY
    u.id;

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


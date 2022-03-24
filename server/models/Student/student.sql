/* @name getGatesStudentById */
SELECT
    student_profiles.user_id AS id,
    grade_levels.name AS current_grade,
    student_partner_orgs.name AS student_partner_org,
    schools.partner AS is_partner_school
FROM
    student_profiles
    JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id
    JOIN grade_levels ON student_profiles.grade_level_id = grade_levels.id
    JOIN schools ON student_profiles.school_id = schools.id
WHERE
    student_profiles.user_id = :userId!;


/* @name getStudentContactInfoById */
SELECT
    id,
    first_name,
    email
FROM
    users
WHERE
    banned IS FALSE
    AND deactivated IS FALSE
    AND test_user IS FALSE
    AND id = :userId!;


/* @name isTestUser */
SELECT
    test_user
FROM
    users
WHERE
    id = :userId!;


/* @name getTotalFavoriteVolunteers */
SELECT
    COUNT(*)::int AS total
FROM
    student_favorite_volunteers
WHERE
    student_id = :userId!;


/* @name isFavoriteVolunteer */
SELECT
    volunteer_id
FROM
    student_favorite_volunteers
WHERE
    student_id = :studentId!
    AND volunteer_id = :volunteerId!;


/* @name getFavoriteVolunteers */
SELECT
    student_favorite_volunteers.volunteer_id AS volunteer_id,
    users.first_name AS first_name,
    COALESCE(sessions.total, 0)::int AS num_sessions
FROM
    student_favorite_volunteers
    LEFT JOIN users ON student_favorite_volunteers.volunteer_id = users.id
    LEFT JOIN (
        SELECT
            count(*) AS total,
            sessions.volunteer_id
        FROM
            sessions
        GROUP BY
            sessions.student_id,
            sessions.volunteer_id) AS sessions ON sessions.volunteer_id = student_favorite_volunteers.volunteer_id
WHERE
    student_favorite_volunteers.student_id = :userId!
ORDER BY
    student_favorite_volunteers.created_at DESC
LIMIT (:limit!)::int OFFSET (:offset!)::int;


/* @name deleteFavoriteVolunteer */
DELETE FROM student_favorite_volunteers
WHERE student_id = :studentId!
    AND volunteer_id = :volunteerId!
RETURNING
    student_id,
    volunteer_id;


/* @name addFavoriteVolunteer */
WITH ins AS (
INSERT INTO student_favorite_volunteers (student_id, volunteer_id, created_at, updated_at)
        VALUES (:studentId!, :volunteerId!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        student_id, volunteer_id)
    SELECT
        *
    FROM
        ins
    UNION
    SELECT
        student_id,
        volunteer_id
    FROM
        student_favorite_volunteers
    WHERE
        student_id = :studentId!
            AND volunteer_id = :volunteerId!;


/* @name getReportedStudent */
SELECT
    users.id AS id,
    first_name,
    last_name,
    email,
    users.created_at AS created_at,
    test_user AS is_test_user,
    banned AS is_banned,
    deactivated AS is_deactivated,
    FALSE AS is_volunteer,
    student_partner_orgs.key AS student_partner_org
FROM
    users
    JOIN student_profiles ON users.id = student_profiles.user_id
    LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id
WHERE
    deactivated IS FALSE
    AND test_user IS FALSE
    AND users.id = :userId!;


/* @name getStudentPartnerInfoById */
SELECT
    student_profiles.user_id AS id,
    student_partner_orgs.key AS student_partner_org,
    school_id AS approved_highschool
FROM
    student_profiles
    LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id
WHERE
    student_profiles.user_id = :userId!;


/* @name deleteStudent */
UPDATE
    users
SET
    email = :email!,
    updated_at = NOW()::date
WHERE
    id = :userId!
RETURNING
    id AS ok;


/* @name adminUpdateStudent */
UPDATE
    users
SET
    first_name = :firstName!,
    last_name = :lastName!,
    email = :email!,
    verified = :verified!,
    banned = :banned!,
    deactivated = :deactivated!,
    updated_at = NOW()::date
WHERE
    id = :userId!
RETURNING
    id AS ok;


/* @name adminUpdateStudentProfile */
UPDATE
    student_profiles
SET
    student_partner_org_id = :partnerOrgId!,
    student_partner_org_site_id = :partnerOrgSiteId!,
    updated_at = NOW()::date
WHERE
    user_id = :userId!
RETURNING
    user_id AS ok;


/* @name getPartnerOrgByKey */
SELECT
    student_partner_orgs.id AS partner_id,
    student_partner_orgs.key AS partner_key,
    student_partner_orgs.name AS partner_name,
    student_partner_org_sites.id AS site_id,
    student_partner_org_sites.name AS site_name
FROM
    student_partner_orgs
    LEFT JOIN (
        SELECT
            name,
            id,
            student_partner_org_id
        FROM
            student_partner_org_sites
        WHERE
            student_partner_org_sites.name = :partnerOrgSiteName) AS student_partner_org_sites ON student_partner_orgs.id = student_partner_org_sites.student_partner_org_id
WHERE
    student_partner_orgs.key = :partnerOrgKey!;


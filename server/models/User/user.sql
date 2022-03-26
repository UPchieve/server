/* @name getUserIdByEmail */
SELECT
    id
FROM
    users
WHERE
    email = :email!
LIMIT 1;


/* @name getUserIdByPhone */
SELECT
    id
FROM
    users
WHERE
    phone = :phone!
LIMIT 1;

/* @name getUserContactInfoById */
SELECT
    users.id,
    first_name,
    email,
    (
        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN
            TRUE
        ELSE
            FALSE
        END) AS is_volunteer,
    volunteer_partner_orgs.key AS volunteer_partner_org
FROM
    users
    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
WHERE
    users.id = :id!
LIMIT 1;


/* @name getUserContactInfoByReferralCode */
SELECT
    users.id,
    first_name,
    email,
    (
        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN
            TRUE
        ELSE
            FALSE
        END) AS is_volunteer,
    volunteer_partner_orgs.key AS volunteer_partner_org
FROM
    users
    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
WHERE
    referral_code = :referralCode!
LIMIT 1;


/* @name getUserForPassport */
SELECT
    id,
    email,
    PASSWORD
FROM
    users
WHERE
    email = :email!
LIMIT 1;


/* @name getUserContactInfoByResetToken */
SELECT
    users.id,
    first_name,
    email,
    (
        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN
            TRUE
        ELSE
            FALSE
        END) AS is_volunteer,
    volunteer_partner_orgs.key AS volunteer_partner_org
FROM
    users
    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
WHERE
    password_reset_token = :resetToken!
LIMIT 1;


/* @name countUsersReferredByOtherId */
SELECT
    count(*)::int AS total
FROM
    users
WHERE
    referred_by = :userId!;


/* @name updateUserResetTokenById */
UPDATE
    users
SET
    password_reset_token = :token!,
    updated_at = NOW()
WHERE
    id = :userId!
RETURNING
    id;


/* @name updateUserPasswordById */
UPDATE
    users
SET
    PASSWORD = :password!,
    updated_at = NOW()
WHERE
    id = :userId!
RETURNING
    id AS ok;


/* @name insertUserIpById */
WITH ins AS (
INSERT INTO users_ip_addresses (id, ip_address_id, user_id, created_at, updated_at)
        VALUES (:id!, :ipId!, :userId!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        id AS ok)
    SELECT
        *
    FROM
        ins
    UNION
    SELECT
        id AS ok
    FROM
        users_ip_addresses
    WHERE
        ip_address_id = :ipId!
            AND user_id = :userId!;


/* @name updateUserVerifiedEmailById */
UPDATE
    users
SET
    email = :email!,
    email_verified = TRUE,
    verified = TRUE,
    updated_at = NOW()
WHERE
    id = :userId!
RETURNING
    id AS ok;


/* @name updateUserVerifiedPhoneById */
UPDATE
    users
SET
    phone = :phone!,
    phone_verified = TRUE,
    verified = TRUE,
    updated_at = NOW()
WHERE
    id = :userId!
RETURNING
    id AS ok;


/* @name updateUserLastActivityById */
UPDATE
    users
SET
    last_activity_at = :lastActivityAt!,
    updated_at = NOW()
WHERE
    id = :userId!
RETURNING
    id AS ok;


/* @name updateUserBanById */
UPDATE
    users
SET
    banned = subquery.banned,
    ban_reason_id = subquery.ban_reason_id,
    updated_at = NOW()
FROM (
    SELECT
        TRUE AS banned,
        id AS ban_reason_id
    FROM
        ban_reasons
    WHERE
        name = :banReason!) AS subquery
WHERE
    id = :userId!
RETURNING
    id AS ok;


/* @name getUserForAdminUpdate */
SELECT
    users.id,
    banned,
    email,
    deactivated,
    (
        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN
            TRUE
        ELSE
            FALSE
        END) AS is_volunteer,
    student_partner_orgs.name AS student_partner_org
FROM
    users
    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN student_profiles ON student_profiles.user_id = users.id
    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id
WHERE
    users.id = :userId!;


/* @name getUsersForAdminSearch */
SELECT
    users.id,
    users.email,
    users.first_name,
    users.last_name,
    users.created_at,
    (
        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN
            TRUE
        ELSE
            FALSE
        END) AS is_volunteer
FROM
    users
    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN student_profiles ON student_profiles.user_id = users.id
    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
    LEFT JOIN schools ON schools.id = student_profiles.school_id
    LEFT JOIN school_nces_metadata ON school_nces_metadata.school_id = schools.id
WHERE ((:userId)::uuid IS NULL
    OR users.id = :userId)
AND ((:email)::text IS NULL
    OR users.email LIKE :email)
AND ((:firstName)::text IS NULL
    OR users.first_name LIKE :firstName)
AND ((:lastName)::text IS NULL
    OR users.last_name LIKE :lastName)
AND ((:partnerOrg)::text IS NULL
    OR volunteer_partner_orgs.name LIKE :partnerOrg
    OR student_partner_orgs.name LIKE :partnerOrg)
AND ((:highSchool)::text IS NULL
    OR schools.name LIKE :highSchool
    OR school_nces_metadata.sch_name LIKE :highSchool)
LIMIT (:limit!)::int OFFSET (:offset!)::int;


/* @name getUserForAdminDetail */
SELECT
    users.id,
    users.first_name AS firstname,
    users.last_name AS lastname,
    users.email,
    users.created_at,
    (
        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN
            TRUE
        ELSE
            FALSE
        END) AS is_volunteer,
    volunteer_profiles.approved AS is_approved,
    (
        CASE WHEN admin_profiles.user_id IS NOT NULL THEN
            TRUE
        ELSE
            FALSE
        END) AS is_admin,
    volunteer_profiles.onboarded AS is_onboarded,
    users.deactivated AS is_deactivated,
    users.test_user AS is_test_user,
    student_profiles.postal_code AS zip_code,
    student_partner_orgs.name AS student_partner_org,
    volunteer_partner_orgs.key AS volunteer_partner_org,
    volunteer_profiles.photo_id_s3_key,
    photo_id_statuses.name AS photo_id_status,
    volunteer_profiles.country,
    users.verified,
    user_product_flags.gates_qualified AS in_gates_study,
    grade_levels.name AS current_grade,
    student_partner_org_sites.name AS partner_site,
    session_count.total AS num_past_sessions,
    occupations.occupation,
    json_build_object('nameStored', schools.name, 'SCH_NAME', school_nces_metadata.sch_name) AS approved_high_school
FROM
    users
    LEFT JOIN student_profiles ON student_profiles.user_id = users.id
    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id
    LEFT JOIN student_partner_org_sites ON student_partner_org_sites.id = student_profiles.student_partner_org_site_id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
    LEFT JOIN admin_profiles ON admin_profiles.user_id = users.id
    LEFT JOIN photo_id_statuses ON photo_id_statuses.id = volunteer_profiles.photo_id_status
    LEFT JOIN user_product_flags ON user_product_flags.user_id = users.id
    LEFT JOIN grade_levels ON grade_levels.id = student_profiles.grade_level_id
    LEFT JOIN (
        SELECT
            COUNT(*) AS total
        FROM
            sessions
        WHERE
            volunteer_id = :userId!
            OR student_id = :userId!) AS session_count ON TRUE
    LEFT JOIN schools ON schools.id = student_profiles.school_id
    LEFT JOIN school_nces_metadata ON school_nces_metadata.school_id = schools.id
    LEFT JOIN (
        SELECT
            array_agg(occupation) AS occupation
        FROM
            volunteer_occupations
        WHERE
            user_id = :userId!
        GROUP BY
            user_id) AS occupations ON TRUE
WHERE
    users.id = :userId!;


/* @name getLegacyUser */
SELECT
    users.id,
    users.first_name,
    users.created_at,
    users.email,
    users.verified,
    users.first_name AS firstname,
    users.phone,
    volunteer_profiles.college,
    (
        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN
            TRUE
        ELSE
            FALSE
        END) AS is_volunteer,
    (
        CASE WHEN admin_profiles.user_id IS NOT NULL THEN
            TRUE
        ELSE
            FALSE
        END) AS is_admin,
    users.banned AS is_banned,
    ban_reasons.name AS ban_reason,
    users.test_user AS is_test_user,
    FALSE AS is_fake_user,
    users.deactivated AS is_deactivated,
    users.last_activity_at AS last_activity_at,
    users.referral_code AS referral_code,
    users.referred_by AS referred_by,
    (
        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN
            'volunteer'
        ELSE
            'student'
        END) AS TYPE,
    volunteer_profiles.onboarded AS is_onboarded,
    volunteer_profiles.approved AS is_approved,
    volunteer_partner_orgs.key AS volunteer_partner_org,
    volunteer_profiles.country,
    volunteer_profiles.timezone,
    photo_id_statuses.name AS photo_id_status,
    past_sessions.sessions AS past_sessions,
    round(past_sessions.time_tutored / 3600000::numeric, 2)::float AS hours_tutored,
    total_subjects.subjects AS subjects,
    recent_availability.updated_at AS availability_last_modified_at,
    occupations.occupations AS occupation,
    student_partner_org_sites.name AS partner_site,
    student_partner_orgs.name AS student_partner_org
FROM
    users
    LEFT JOIN (
        SELECT
            updated_at
        FROM
            availability_histories
        WHERE
            availability_histories.user_id = :userId!
        ORDER BY
            updated_at
        LIMIT 1) AS recent_availability ON TRUE
    LEFT JOIN (
        SELECT
            array_agg(occupation) AS occupations
        FROM
            volunteer_occupations
        WHERE
            user_id = :userId!) AS occupations ON TRUE
    LEFT JOIN student_profiles ON student_profiles.user_id = users.id
    LEFT JOIN admin_profiles ON users.id = admin_profiles.user_id
    LEFT JOIN volunteer_profiles ON users.id = volunteer_profiles.user_id
    LEFT JOIN photo_id_statuses ON photo_id_statuses.id = volunteer_profiles.photo_id_status
    LEFT JOIN volunteer_partner_orgs ON volunteer_profiles.volunteer_partner_org_id = volunteer_partner_orgs.id
    LEFT JOIN ban_reasons ON users.ban_reason_id = ban_reasons.id
    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id
    LEFT JOIN student_partner_org_sites ON student_partner_org_sites.id = student_profiles.student_partner_org_site_id
    LEFT JOIN (
        SELECT
            array_agg(subjects_unlocked.subject) AS subjects
        FROM (
            SELECT
                subjects.name AS subject,
                COUNT(*)::int AS earned_certs,
                subject_certs.total
            FROM
                users_certifications
                JOIN certification_subject_unlocks USING (certification_id)
                JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
                JOIN users ON users.id = users_certifications.user_id
                JOIN (
                    SELECT
                        subjects.name, COUNT(*)::int AS total
                    FROM
                        certification_subject_unlocks
                        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
                    GROUP BY
                        subjects.name) AS subject_certs ON subject_certs.name = subjects.name
                WHERE
                    users.id = :userId!
                GROUP BY
                    subjects.name,
                    subject_certs.total
                HAVING
                    COUNT(*)::int >= subject_certs.total) AS subjects_unlocked) AS total_subjects ON TRUE
    LEFT JOIN (
        SELECT
            array_agg(id) AS sessions,
            sum(time_tutored)::int AS time_tutored
        FROM
            sessions
        WHERE
            student_id = :userId!
            OR volunteer_id = :userId!) AS past_sessions ON TRUE
WHERE
    users.id = :userId!;


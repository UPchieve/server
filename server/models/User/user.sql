/* @name createUser */
INSERT INTO users (id, first_name, last_name, email, proxy_email, phone, PASSWORD, password_reset_token, verified, email_verified, phone_verified, referred_by, referral_code, signup_source_id, other_signup_source, last_activity_at)
    VALUES (:id!, :firstName!, :lastName!, :email!, :proxyEmail, :phone, :password, :passwordResetToken, :verified, :emailVerified, :phoneVerified, :referredBy, :referralCode!, :signupSourceId, :otherSignupSource, NOW())
ON CONFLICT (email)
    DO NOTHING
RETURNING
    id, email, first_name, proxy_email;


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
    banned,
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
    volunteer_partner_orgs.key AS volunteer_partner_org,
    student_partner_orgs.key AS student_partner_org,
    users.last_activity_at,
    deactivated,
    volunteer_profiles.approved,
    users.phone,
    users.phone_verified,
    users.sms_consent
FROM
    users
    LEFT JOIN admin_profiles ON admin_profiles.user_id = users.id
    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
    LEFT JOIN student_profiles ON student_profiles.user_id = users.id
    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id
WHERE
    users.id = :id!
LIMIT 1;


/* @name getUserContactInfoByReferralCode */
SELECT
    users.id,
    first_name,
    email,
    banned,
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
    volunteer_partner_orgs.key AS volunteer_partner_org,
    student_partner_orgs.key AS student_partner_org,
    users.last_activity_at,
    deactivated,
    volunteer_profiles.approved,
    users.phone,
    users.phone_verified,
    users.sms_consent
FROM
    users
    LEFT JOIN admin_profiles ON admin_profiles.user_id = users.id
    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
    LEFT JOIN student_profiles ON student_profiles.user_id = users.id
    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id
WHERE
    referral_code = :referralCode!
LIMIT 1;


/* @name getUserReferralLink */
SELECT
    first_name,
    email,
    referral_code
FROM
    users
WHERE
    id = :id!;


/* @name getUserForPassport */
SELECT
    id,
    email,
    proxy_email,
    PASSWORD
FROM
    users
WHERE
    LOWER(email) = LOWER(:email!)
LIMIT 1;


/* @name getUserContactInfoByResetToken */
SELECT
    users.id,
    first_name,
    email,
    banned,
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
    volunteer_partner_orgs.key AS volunteer_partner_org,
    student_partner_orgs.key AS student_partner_org,
    users.last_activity_at,
    deactivated,
    volunteer_profiles.approved,
    users.phone,
    users.phone_verified,
    users.sms_consent
FROM
    users
    LEFT JOIN admin_profiles ON admin_profiles.user_id = users.id
    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
    LEFT JOIN student_profiles ON student_profiles.user_id = users.id
    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id
WHERE
    password_reset_token = :resetToken!
LIMIT 1;


/* @name deleteUser */
UPDATE
    users
SET
    email = :email!,
    updated_at = NOW()
WHERE
    id = :userId!
RETURNING
    id AS ok;


/* @name countUsersReferredByOtherId */
SELECT
    count(*)::int AS total
FROM
    users
WHERE
    referred_by = :userId!
    AND phone_verified IS TRUE
    OR email_verified IS TRUE;


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
    email AS ok;


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
    phone AS ok;


/* @name updateUserPhoneNumberByUserId */
UPDATE
    users
SET
    phone = :phone!,
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
    (
        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN
            users.last_name
        ELSE
            NULL
        END) AS last_name,
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
    OR users.email ILIKE ('%' || :email || '%'))
AND ((:firstName)::text IS NULL
    OR users.first_name ILIKE ('%' || :firstName || '%'))
AND ((:lastName)::text IS NULL
    OR users.last_name ILIKE ('%' || :lastName || '%'))
AND ((:partnerOrg)::text IS NULL
    OR volunteer_partner_orgs.key = :partnerOrg
    OR student_partner_orgs.key = :partnerOrg)
AND ((:highSchool)::text IS NULL
    OR schools.name ILIKE ('%' || :highSchool || '%')
    OR school_nces_metadata.sch_name ILIKE ('%' || :highSchool || '%'))
LIMIT (:limit!)::int OFFSET (:offset!)::int;


/* @name getUserForAdminDetail */
SELECT
    users.id,
    users.first_name AS first_name,
    (
        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN
            users.last_name
        ELSE
            NULL
        END) AS last_name,
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
    volunteer_partner_orgs.name AS volunteer_partner_org,
    volunteer_profiles.photo_id_s3_key,
    photo_id_statuses.name AS photo_id_status,
    volunteer_profiles.country,
    volunteer_profiles.linkedin_url,
    volunteer_profiles.college,
    volunteer_profiles.company,
    volunteer_profiles.languages,
    volunteer_profiles.experience,
    volunteer_profiles.city,
    volunteer_profiles.state,
    users.verified,
    users.banned AS is_banned,
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
    users.email_verified,
    users.verified,
    users.first_name AS firstname,
    users.phone,
    users.phone_verified,
    users.sms_consent,
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
    COALESCE(past_sessions.sessions, '{}') AS past_sessions,
    round(past_sessions.time_tutored / 3600000::numeric, 2)::float AS hours_tutored,
    COALESCE(past_sessions.time_tutored::float, 0) AS total_time_tutored,
    COALESCE(array_length(past_sessions.total_tutored_sessions, 1), 0) AS total_tutored_sessions,
    array_cat(total_subjects.subjects, computed_subjects.subjects) AS subjects,
    recent_availability.updated_at AS availability_last_modified_at,
    occupations.occupations AS occupation,
    student_partner_org_sites.name AS partner_site,
    student_partner_orgs.name AS student_partner_org,
    COALESCE(volunteer_profiles.elapsed_availability, 0) AS elapsed_availability,
    volunteer_profiles.total_volunteer_hours,
    schools.name AS school_name,
    schools.partner AS is_school_partner,
    grade_levels.name AS grade_level,
    array_cat(total_subjects.active_subjects, computed_subjects.active_subjects) AS active_subjects,
    users_quizzes.total::int AS total_quizzes_passed,
    users_roles.role_id,
    muted_users_subject_alerts_agg.muted_subject_alerts
FROM
    users
    LEFT JOIN (
        SELECT
            updated_at
        FROM
            availabilities
        WHERE
            availabilities.user_id = :userId!
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
            array_agg(subjects_unlocked.subject) AS subjects,
            array_agg(subjects_unlocked.subject) FILTER (WHERE subjects_unlocked.active_cert IS TRUE) AS active_subjects
        FROM (
            SELECT
                subjects.name AS subject,
                COUNT(*)::int AS earned_certs,
                subject_certs.total,
                certifications.active AS active_cert
            FROM
                users_certifications
                JOIN certification_subject_unlocks USING (certification_id)
                JOIN certifications ON users_certifications.certification_id = certifications.id
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
                    subject_certs.total,
                    certifications.active) AS subjects_unlocked) AS total_subjects ON TRUE
    LEFT JOIN (
        SELECT
            array_agg(computed_subjects_unlocked.subject) AS subjects,
            array_agg(computed_subjects_unlocked.subject) FILTER (WHERE computed_subjects_unlocked.active_cert IS TRUE) AS active_subjects
        FROM (
            SELECT
                subjects.name AS subject,
                COUNT(*)::int AS earned_certs,
                subject_certs.total,
                certifications.active AS active_cert
            FROM
                users_certifications
                JOIN computed_subject_unlocks USING (certification_id)
                JOIN certifications ON users_certifications.certification_id = certifications.id
                JOIN subjects ON computed_subject_unlocks.subject_id = subjects.id
                JOIN users ON users.id = users_certifications.user_id
                JOIN (
                    SELECT
                        subjects.name, COUNT(*)::int AS total
                    FROM
                        computed_subject_unlocks
                        JOIN subjects ON subjects.id = computed_subject_unlocks.subject_id
                    GROUP BY
                        subjects.name) AS subject_certs ON subject_certs.name = subjects.name
                WHERE
                    users.id = :userId!
                GROUP BY
                    subjects.name,
                    subject_certs.total,
                    certifications.active
                HAVING
                    COUNT(*)::int >= subject_certs.total) AS computed_subjects_unlocked) AS computed_subjects ON TRUE
    LEFT JOIN (
        SELECT
            array_agg(id) AS sessions,
            sum(time_tutored)::bigint AS time_tutored,
            array_agg(id) FILTER (WHERE time_tutored > 0) AS total_tutored_sessions
        FROM
            sessions
        WHERE
            student_id = :userId!
            OR volunteer_id = :userId!) AS past_sessions ON TRUE
    LEFT JOIN (
        SELECT
            count(*) AS total
        FROM
            users_quizzes
        WHERE
            user_id = :userId!
            AND passed IS TRUE) AS users_quizzes ON TRUE
    LEFT JOIN schools ON student_profiles.school_id = schools.id
    LEFT JOIN grade_levels ON student_profiles.grade_level_id = grade_levels.id
    LEFT JOIN users_roles ON users_roles.user_id = users.id
    LEFT JOIN (
        SELECT
            array_agg(subjects.name) AS muted_subject_alerts
        FROM
            muted_users_subject_alerts
            JOIN subjects ON muted_users_subject_alerts.subject_id = subjects.id
        WHERE
            muted_users_subject_alerts.user_id = :userId!) AS muted_users_subject_alerts_agg ON TRUE
WHERE
    users.id = :userId!;


/* @name getUserToCreateSendGridContact */
SELECT
    users.id,
    first_name,
    email,
    sms_consent,
    phone_verified,
    banned,
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
    volunteer_partner_orgs.key AS volunteer_partner_org,
    volunteer_partner_orgs.name AS volunteer_partner_org_display,
    student_partner_orgs.key AS student_partner_org,
    student_partner_orgs.name AS student_partner_org_display,
    users.last_activity_at,
    users.created_at,
    users.deactivated,
    (
        CASE WHEN user_upchieve101.id IS NULL THEN
            FALSE
        ELSE
            TRUE
        END) AS passed_upchieve101,
    users.test_user,
    users.last_name,
    grade_levels.name AS student_grade_level
FROM
    users
    LEFT JOIN admin_profiles ON admin_profiles.user_id = users.id
    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
    LEFT JOIN student_profiles ON student_profiles.user_id = users.id
    LEFT JOIN student_partner_orgs ON student_partner_orgs.id = student_profiles.student_partner_org_id
    LEFT JOIN LATERAL (
        SELECT
            id
        FROM
            users_training_courses
            LEFT JOIN training_courses ON training_courses.id = users_training_courses.training_course_id
        WHERE
            users_training_courses.user_id = users.id
            AND training_courses.name = 'UPchieve 101') AS user_upchieve101 ON TRUE
    LEFT JOIN grade_levels ON student_profiles.grade_level_id = grade_levels.id
WHERE
    users.id = :userId!
LIMIT 1;


/* @name getPastSessionsForAdminDetail */
SELECT
    topics.name AS TYPE,
    subjects.name AS sub_topic,
    sessions.id,
    messages.total AS total_messages,
    sessions.volunteer_id AS volunteer,
    sessions.student_id AS student,
    sessions.volunteer_joined_at,
    sessions.created_at,
    sessions.ended_at
FROM
    sessions
    LEFT JOIN subjects ON subjects.id = sessions.subject_id
    LEFT JOIN topics ON topics.id = subjects.topic_id
    LEFT JOIN LATERAL (
        SELECT
            COUNT(*)::int AS total
        FROM
            session_messages
        WHERE
            session_id = sessions.id) AS messages ON TRUE
WHERE
    sessions.volunteer_id = :userId!
    OR sessions.student_id = :userId!
ORDER BY
    sessions.created_at DESC
LIMIT (:limit!)::int OFFSET (:offset!)::int;


/* @name getLegacyCertifications */
SELECT
    name
FROM
    quizzes;


/* @name getTotalSessionsByUserId */
SELECT
    count(*)::int AS total
FROM
    sessions
WHERE
    sessions.student_id = :userId!
    OR sessions.volunteer_id = :userId!;


/* @name insertUserRoleByUserId */
INSERT INTO users_roles (role_id, user_id, created_at, updated_at)
SELECT
    subquery.id,
    :userId!,
    NOW(),
    NOW()
FROM (
    SELECT
        id
    FROM
        user_roles
    WHERE
        user_roles.name = :roleName!) AS subquery
ON CONFLICT
    DO NOTHING
RETURNING
    user_id AS ok;


/* @name updateUserProfileById */
UPDATE
    users
SET
    deactivated = COALESCE(:deactivated, deactivated),
    phone = COALESCE(:phone, phone),
    sms_consent = COALESCE(:smsConsent, sms_consent)
WHERE
    id = :userId!
RETURNING
    id AS ok;


/*
 @name insertMutedUserSubjectAlerts
 @param mutedSubjectAlertIdsWithUserId -> ((userId, subjectId)...)
 */
INSERT INTO muted_users_subject_alerts (user_id, subject_id)
    VALUES
        :mutedSubjectAlertIdsWithUserId
    ON CONFLICT (user_id, subject_id)
        DO NOTHING
    RETURNING
        user_id AS ok;


/*
 @name deleteUnmutedUserSubjectAlerts
 @param mutedSubjectAlertIds -> (...)
 */
DELETE FROM muted_users_subject_alerts
WHERE user_id = :userId
    AND subject_id NOT IN :mutedSubjectAlertIds
RETURNING
    user_id AS ok;


/*
 @name deleteAllUserSubjectAlerts
 */
DELETE FROM muted_users_subject_alerts
WHERE user_id = :userId
RETURNING
    user_id AS ok;


/* @name getUserVerificationInfoById */
SELECT
    verified,
    email_verified,
    phone_verified
FROM
    users
WHERE
    id = :userId!;


/* @name getReportedUser */
SELECT
    users.id AS id,
    first_name,
    last_name,
    email,
    users.created_at AS created_at,
    test_user AS is_test_user,
    banned AS is_banned,
    deactivated AS is_deactivated,
    (
        CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN
            TRUE
        ELSE
            FALSE
        END) AS is_volunteer,
    student_partner_orgs.key AS student_partner_org,
    volunteer_partner_orgs.key AS volunteer_partner_org
FROM
    users
    LEFT JOIN student_profiles ON users.id = student_profiles.user_id
    LEFT JOIN student_partner_orgs ON student_profiles.student_partner_org_id = student_partner_orgs.id
    LEFT JOIN volunteer_profiles ON users.id = volunteer_profiles.user_id
    LEFT JOIN volunteer_partner_orgs ON volunteer_profiles.volunteer_partner_org_id = volunteer_partner_orgs.id
WHERE
    deactivated IS FALSE
    AND test_user IS FALSE
    AND users.id = :userId!;


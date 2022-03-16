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
    id,
    first_name,
    email
FROM
    users
WHERE
    id = :id!
LIMIT 1;


/* @name getUserContactInfoByReferralCode */
SELECT
    id,
    first_name,
    email
FROM
    users
WHERE
    referral_code = :referralCode!
LIMIT 1;

/* @name getUserForPassport */
SELECT
    id,
    email,
    password
FROM
    users
WHERE
    email = :email!
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
    id,
    first_name,
    email
FROM
    users
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
    password_reset_token = :token!
WHERE
    id = :userId!
RETURNING
    id;

/* @name updateUserPasswordById */
UPDATE
    users
SET
    password = :password!
WHERE
    id = :userId!
RETURNING
    id AS ok;

/* @name insertUserIpById */
WITH ins AS(
    INSERT INTO users_ip_addresses (id, ip_address_id, user_id, created_at, updated_at)
        VALUES (:id!, :ipId!, :userId!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        id AS ok
)
SELECT * FROM ins
UNION
    SELECT id AS ok FROM users_ip_addresses WHERE ip_address_id = :ipId! AND user_id = :userId!;

/* @name updateUserVerifiedEmailById */
UPDATE
    users
SET
    email = :email!,
    email_verified = true,
    verified = true
WHERE
    id = :userId!
RETURNING
    id AS ok;

/* @name updateUserVerifiedPhoneById */
UPDATE
    users
SET
    phone = :phone!,
    phone_verified = true,
    verified = true
WHERE
    id = :userId!
RETURNING
    id AS ok;

/* @name updateUserLastActivityById */
UPDATE
    users
SET
    last_activity_at = :lastActivityAt!
WHERE
    id = :userId!
RETURNING
    id AS ok;

/* @name updateUserBanById */
UPDATE
    users
SET
    banned = subquery.banned,
    ban_reason_id = subquery.ban_reason_id
FROM (
    SELECT
        true AS banned,
        id AS ban_reason_id
    FROM
        ban_reasons
    WHERE
        name = :banReason!
) AS subquery
WHERE
    id = :userId!
RETURNING
    id AS ok;

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
    (CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN true
         ELSE FALSE
    END) as is_volunteer,
    (CASE WHEN admin_profiles.user_id IS NOT NULL THEN true
         ELSE FALSE
    END) as is_volunteer,
    users.banned AS isBanned,
    ban_reasons.name AS banReason,
    users.test_user AS isTestUser,
    false AS isFakeUser,
    users.deactivated AS isDeactivated,
    users.last_activity_at AS lastActivityAt,
    users.referral_code AS referralCode,
    users.referred_by AS referredBy,
    (CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN 'volunteer'
         ELSE 'student'
    END) as type,
    volunteer_profiles.onboarded AS isOnboarded,
    volunteer_profiles.approved AS isApproved,
    volunteer_partner_orgs.name AS volunteerPartnerOrg,
    volunteer_profiles.country,
    volunteer_profiles.timezone,
    volunteer_profiles.photo_id_status AS photoIdStatus
FROM users
LEFT JOIN admin_profiles ON users.id = admin_profiles.user_id
LEFT JOIN volunteer_profiles ON users.id = volunteer_profiles.user_id
LEFT JOIN volunteer_partner_orgs ON volunteer_profiles.volunteer_partner_org_id = volunteer_partner_orgs.id
LEFT JOIN ban_reasons ON users.ban_reason_id = ban_reasons.id
WHERE
    users.id = :userId!;


SELECT
    users.id,
    users.first_name,
    users.created_at,
    users.email,
    users.verified,
    users.first_name AS firstname,
    users.phone,
    volunteer_profiles.college,
    (CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN true
         ELSE FALSE
    END) as is_volunteer,
    (CASE WHEN admin_profiles.user_id IS NOT NULL THEN true
         ELSE FALSE
    END) as is_volunteer,
    users.banned AS isBanned,
    ban_reasons.name AS banReason,
    users.test_user AS isTestUser,
    false AS isFakeUser,
    users.deactivated AS isDeactivated,
    users.last_activity_at AS lastActivityAt,
    users.referral_code AS referralCode,
    users.referred_by AS referredBy,
    (CASE WHEN volunteer_profiles.user_id IS NOT NULL THEN 'volunteer'
         ELSE 'student'
    END) as type,
    volunteer_profiles.onboarded AS isOnboarded,
    volunteer_profiles.approved AS isApproved,
    volunteer_partner_orgs.name AS volunteerPartnerOrg,
    volunteer_profiles.country,
    volunteer_profiles.timezone,
    volunteer_profiles.photo_id_status AS photoIdStatus,
    past_sessions.sessions AS pastSessions,
    round(past_sessions.time_tutored/3600000::numeric, 2) AS hoursTutored
FROM users
LEFT JOIN admin_profiles ON users.id = admin_profiles.user_id
LEFT JOIN volunteer_profiles ON users.id = volunteer_profiles.user_id
LEFT JOIN volunteer_partner_orgs ON volunteer_profiles.volunteer_partner_org_id = volunteer_partner_orgs.id
LEFT JOIN ban_reasons ON users.ban_reason_id = ban_reasons.id
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
                  subjects.name,
                  COUNT(*)::int AS total
              FROM
                  certification_subject_unlocks
                  JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
              GROUP BY
                  subjects.name
          ) AS subject_certs ON subject_certs.name = subjects.name
      WHERE
          users.id = '017F8F3748284DEAC13784F0B7D7E8C9'
      GROUP BY
          subjects.name, subject_certs.total
      HAVING
          COUNT(*)::int >= subject_certs.total) AS subjects_unlocked
) AS total_subjects ON true
LEFT JOIN (
  SELECT
  	array_agg(id) AS sessions,
  	sum(time_tutored)::int AS time_tutored
  FROM
  	sessions
  WHERE
  	student_id = '017F8F3748284DEAC13784F0B7D7E8C9' OR
  	volunteer_id = '017F8F3748284DEAC13784F0B7D7E8C9'
) AS past_sessions ON true
WHERE
    users.id = '017F8F3748284DEAC13784F0B7D7E8C9';

/* @name getVolunteerContactInfoById */
SELECT
    users.id,
    first_name,
    last_name,
    phone,
    email,
    volunteer_partner_orgs.key AS volunteer_partner_org
FROM
    users
    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
WHERE
    users.id = :userId!
    AND users.banned IS FALSE
    AND users.deactivated IS FALSE
    AND users.test_user IS FALSE;


/* @name getVolunteerContactInfoByIds */
SELECT
    users.id,
    first_name,
    last_name,
    phone,
    email,
    volunteer_partner_orgs.key AS volunteer_partner_org
FROM
    users
    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
WHERE
    users.id = ANY (:userIds!)
    AND users.banned IS FALSE
    AND users.deactivated IS FALSE
    AND users.test_user IS FALSE;


/* @name getVolunteersForBlackoutOver */
SELECT
    users.id,
    first_name,
    last_name,
    phone,
    email,
    volunteer_partner_orgs.key AS volunteer_partner_org
FROM
    users
    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
WHERE
    users.id = :userId!
    AND users.last_activity_at < :startDate!
    AND users.banned IS FALSE
    AND users.deactivated IS FALSE
    AND users.test_user IS FALSE;


/* @name getVolunteerForQuickTips*/
SELECT
    users.id,
    first_name,
    last_name,
    phone,
    email,
    volunteer_partner_orgs.key AS volunteer_partner_org
FROM
    users
    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
WHERE
    users.id = :userId!
    AND volunteer_profiles.onboarded IS TRUE
    AND users.banned IS FALSE
    AND users.deactivated IS FALSE
    AND users.test_user IS FALSE;


/* @name getPartnerVolunteerForLowHours */
SELECT
    users.id,
    first_name,
    last_name,
    phone,
    email,
    volunteer_partner_orgs.key AS volunteer_partner_org
FROM
    users
    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
    LEFT JOIN (
        SELECT
            COUNT(*)::int AS total
        FROM
            sessions
        WHERE
            sessions.volunteer_id = :userId!) AS total_sessions ON TRUE
WHERE
    users.id = :userId!
    AND volunteer_profiles.onboarded IS TRUE
    AND volunteer_profiles.volunteer_partner_org_id IS NOT NULL
    AND users.banned IS FALSE
    AND users.deactivated IS FALSE
    AND total_sessions.total > 0
    AND users.test_user IS FALSE;


/* @name getPartnerVolunteerForCollege */
WITH CTE AS (
    SELECT
        subjects.name,
        COUNT(*)::int AS total
    FROM
        certification_subject_unlocks
        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
    GROUP BY
        subjects.name
)
SELECT
    users.id,
    first_name,
    last_name,
    phone,
    email,
    volunteer_partner_orgs.key AS volunteer_partner_org
FROM
    users
    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
    LEFT JOIN (
        SELECT
            array_agg(DISTINCT subjects_unlocked.topic) AS topics
        FROM (
            SELECT
                subjects.name AS subject,
                topics.name AS topic
            FROM
                users_certifications
                JOIN certification_subject_unlocks USING (certification_id)
                JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
                JOIN users ON users.id = users_certifications.user_id
                JOIN topics ON topics.id = subjects.topic_id
                JOIN CTE ON CTE.name = subjects.name
            WHERE
                users.id = :userId!
            GROUP BY
                subjects.name, CTE.total, topics.name
            HAVING
                COUNT(*)::int >= CTE.total) AS subjects_unlocked) AS topics_unlocked ON TRUE
WHERE
    users.id = :userId!
    AND volunteer_profiles.onboarded IS TRUE
    AND array_length(topics_unlocked.topics, 1) = 1
    AND topics_unlocked.topics = ARRAY['college']
    AND volunteer_profiles.volunteer_partner_org_id IS NOT NULL
    AND users.banned IS FALSE
    AND users.deactivated IS FALSE
    AND users.test_user IS FALSE;


/* @name getVolunteersForWeeklyHourSummary */
SELECT
    users.id,
    first_name,
    last_name,
    phone,
    email,
    volunteer_partner_orgs.key AS volunteer_partner_org,
    sent_hour_summary_intro_email
FROM
    users
    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
    LEFT JOIN user_product_flags ON users.id = user_product_flags.user_id
WHERE
    NOT volunteer_partner_orgs.key = ANY (:unsubscribedPartners!)
    AND users.banned IS FALSE
    AND users.deactivated IS FALSE
    AND users.test_user IS FALSE
GROUP BY
    users.id,
    volunteer_partner_org,
    sent_hour_summary_intro_email;


/* @name updateVolunteerHourSummaryIntroById */
UPDATE
    user_product_flags
SET
    sent_hour_summary_intro_email = TRUE,
    updated_at = NOW()
WHERE
    user_id = :userId!
RETURNING
    user_id AS ok;

/* @name updateVolunteerThroughAvailability */
UPDATE
    volunteer_profiles
SET
    timezone = COALESCE(:timezone, timezone),
    onboarded = COALESCE(:onboarded, onboarded),
    updated_at = NOW()
WHERE
    user_id = :userId!
RETURNING
    user_id AS ok;


/* @name getVolunteerIdsForElapsedAvailability */
SELECT
    user_id
FROM
    volunteer_profiles
    LEFT JOIN users ON volunteer_profiles.user_id = users.id
WHERE
    users.deactivated IS FALSE
    AND users.test_user IS FALSE;


/* @name getVolunteersForTotalHours */
SELECT
    users.id
FROM
    users
    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
    LEFT JOIN user_product_flags ON users.id = user_product_flags.user_id
WHERE
    volunteer_partner_orgs.key = ANY (:targetPartnerOrgs!)
    AND volunteer_profiles.onboarded IS TRUE
    AND volunteer_profiles.approved IS TRUE
    AND users.banned IS FALSE
    AND users.deactivated IS FALSE
    AND users.test_user IS FALSE
GROUP BY
    users.id;


/* @name getVolunteerForOnboardingById */
WITH CTE AS (
    SELECT
        subjects.name,
        COUNT(*)::int AS total
    FROM
        certification_subject_unlocks
        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
    GROUP BY
        subjects.name
)
SELECT
    users.id,
    email,
    first_name,
    volunteer_profiles.onboarded,
    array_agg(subjects_unlocked.subject) AS subjects,
    country,
    MAX(availabilities.updated_at) AS availability_last_modified_at
FROM
    users
    LEFT JOIN (
        SELECT
            subjects.name AS subject,
            COUNT(*)::int AS earned_certs,
            CTE.total
        FROM
            users_certifications
            JOIN certification_subject_unlocks USING (certification_id)
            JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
            JOIN users ON users.id = users_certifications.user_id
            JOIN CTE ON CTE.name = subjects.name
        WHERE
            users.id = :userId!
        GROUP BY
            subjects.name, CTE.total
        HAVING
            COUNT(*)::int >= CTE.total) AS subjects_unlocked ON TRUE
    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN availabilities ON availabilities.user_id = users.id
WHERE
    users.banned IS FALSE
    AND users.deactivated IS FALSE
    AND users.test_user IS FALSE
    AND volunteer_profiles.onboarded IS FALSE
GROUP BY
    users.id,
    onboarded,
    country;


/* @name getVolunteersForTelecomReport */
SELECT
    users.id,
    first_name,
    last_name,
    phone,
    email,
    volunteer_partner_orgs.key AS volunteer_partner_org,
    users.created_at
FROM
    users
    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
WHERE
    volunteer_partner_orgs.key = :partnerOrg!
    AND users.banned IS FALSE
    AND users.deactivated IS FALSE
    AND users.test_user IS FALSE
    AND volunteer_profiles.onboarded IS TRUE
    AND volunteer_profiles.approved IS TRUE
GROUP BY
    users.id,
    volunteer_partner_org;


/* @name getVolunteersNotifiedSinceDate */
SELECT
    users.id
FROM
    users
    LEFT JOIN notifications ON users.id = notifications.user_id
GROUP BY
    users.id
HAVING
    MAX(notifications.sent_at) > :sinceDate!;


/* @name getVolunteersNotifiedBySessionId */
SELECT
    notifications.user_id
FROM
    notifications
WHERE
    notifications.session_id = :sessionId!;


/* @name getVolunteerByReference */
SELECT
    volunteer_references.user_id
FROM
    volunteer_references
WHERE
    volunteer_references.id = :referenceId!;


/* @name addVolunteerReferenceById */
INSERT INTO volunteer_references (id, user_id, first_name, last_name, email, status_id, created_at, updated_at)
SELECT
    :id!,
    :userId!,
    :firstName!,
    :lastName!,
    :email!,
    volunteer_reference_statuses.id,
    NOW(),
    NOW()
FROM
    volunteer_reference_statuses
WHERE
    name = 'unsent'::text
ON CONFLICT (user_id,
    email)
    DO NOTHING
RETURNING
    id AS ok;


/* @name getInactiveVolunteers */
SELECT
    users.id,
    first_name,
    last_name,
    phone,
    email,
    volunteer_partner_orgs.key AS volunteer_partner_org
FROM
    users
    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
WHERE
    users.last_activity_at >= :start!
    AND users.last_activity_at < :end!
    AND users.banned IS FALSE
    AND users.deactivated IS FALSE
    AND users.test_user IS FALSE;


/* @name updateVolunteerReferenceStatusById */
UPDATE
    volunteer_references
SET
    status_id = subquery.id,
    sent_at = NOW(),
    updated_at = NOW()
FROM (
    SELECT
        id
    FROM
        volunteer_reference_statuses
    WHERE
        name = 'sent') AS subquery
WHERE
    volunteer_references.id = :referenceId!
RETURNING
    volunteer_references.id AS ok;


/* @name deleteVolunteerReferenceById */
UPDATE
    volunteer_references
SET
    status_id = subquery.id,
    updated_at = NOW()
FROM (
    SELECT
        id
    FROM
        volunteer_reference_statuses
    WHERE
        name = 'removed') AS subquery
WHERE
    volunteer_references.email = :referenceEmail! AND
    volunteer_references.user_id = :userId!
RETURNING
    volunteer_references.id AS ok;


/* @name updateVolunteersReadyToCoachByIds */
UPDATE
    user_product_flags
SET
    sent_ready_to_coach_email = TRUE,
    updated_at = NOW()
WHERE
    user_id = ANY (:userIds!)
RETURNING
    user_id AS ok;


/* @name updateVolunteerElapsedAvailabilityById */
UPDATE
    volunteer_profiles
SET
    elapsed_availability = subquery.total
FROM (
    SELECT
        COALESCE(elapsed_availability, 0) + (:elapsedAvailability!)::int AS total
    FROM
        volunteer_profiles
    WHERE
        user_id = :userId!) AS subquery
WHERE
    user_id = :userId!
RETURNING
    user_id AS ok;


/* @name updateVolunteerTotalHoursById */
UPDATE
    volunteer_profiles
SET
    total_volunteer_hours = subquery.total
FROM (
    SELECT
        COALESCE(total_volunteer_hours, 0) + (:totalHours!)::numeric AS total
    FROM
        volunteer_profiles
    WHERE
        user_id = :userId!) AS subquery
WHERE
    user_id = :userId!
RETURNING
    user_id AS ok;

/* @name getVolunteerTrainingCourses */
SELECT
    user_id,
    complete,
    training_courses.name AS training_course,
    progress,
    completed_materials,
    users_training_courses.created_at,
    users_training_courses.updated_at
FROM users_training_courses
LEFT JOIN training_courses ON training_courses.id = users_training_courses.training_course_id
WHERE
    users_training_courses.user_id = :userId!;

/* @name updateVolunteerTrainingById */
INSERT INTO users_training_courses AS ins (user_id, training_course_id, complete, progress, completed_materials, created_at, updated_at)
SELECT
    :userId!,
    training_courses.id,
    :complete!,
    :progress!,
    ARRAY[(:materialKey!)::text],
    NOW(),
    NOW()
FROM
    training_courses
WHERE
    training_courses.name = :trainingCourse!
ON CONFLICT (user_id,
    training_course_id)
    DO UPDATE SET
        complete = :complete!,
        progress = :progress!,
        completed_materials = ARRAY_APPEND(ins.completed_materials, :materialKey!),
        updated_at = NOW()
    WHERE
        NOT :materialKey! = ANY (ins.completed_materials)
    RETURNING
        user_id AS ok;


/* @name updateVolunteerPhotoIdById */
UPDATE
    volunteer_profiles
SET
    photo_id_s3_key = :key!,
    photo_id_status = subquery.id
FROM (
    SELECT
        id
    FROM
        photo_id_statuses
    WHERE
        name = :status!) AS subquery
WHERE
    user_id = :userId!
RETURNING
    user_id AS ok;


/* @name updateVolunteerSentInactive30DayEmail */
UPDATE
    user_product_flags
SET
    sent_inactive_thirty_day_email = TRUE,
    updated_at = NOW()
WHERE
    user_id = :userId!
RETURNING
    user_id AS ok;


/* @name updateVolunteerSentInactive60DayEmail */
UPDATE
    user_product_flags
SET
    sent_inactive_thirty_day_email = TRUE,
    sent_inactive_sixty_day_email = TRUE,
    updated_at = NOW()
WHERE
    user_id = :userId!
RETURNING
    user_id AS ok;


/* @name updateVolunteerSentInactive90DayEmail */
UPDATE
    user_product_flags
SET
    sent_inactive_ninety_day_email = TRUE,
    updated_at = NOW()
WHERE
    user_id = :userId!
RETURNING
    user_id AS ok;


/* @name updateVolunteerProfileById */
UPDATE
    users
SET
    deactivated = COALESCE(:deactivated, deactivated),
    phone = COALESCE(:phone, phone)
WHERE
    id = :userId!
RETURNING
    id AS ok;


/* @name getVolunteerUnsentReferences */
SELECT
    volunteer_references.id,
    user_id,
    first_name,
    last_name,
    email,
    volunteer_reference_statuses.name AS status
FROM
    volunteer_references
    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id
WHERE
    volunteer_reference_statuses.name = 'unsent';


/* @name getReferencesByVolunteer */
SELECT
    volunteer_references.id,
    first_name,
    last_name,
    email,
    volunteer_reference_statuses.name AS status
FROM
    volunteer_references
    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id
WHERE
    volunteer_references.user_id = :userId!;


/* @name getVolunteerForPendingStatus */
SELECT
    users.id,
    first_name,
    last_name,
    phone,
    email,
    volunteer_profiles.approved,
    volunteer_profiles.onboarded,
    volunteer_profiles.country,
    photo_id_statuses.name AS photo_id_status,
    volunteer_partner_orgs.key AS volunteer_partner_org,
    occupations.occupations
FROM
    users
    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
    LEFT JOIN photo_id_statuses ON photo_id_statuses.id = volunteer_profiles.photo_id_status
    LEFT JOIN (
        SELECT
            array_agg(occupation) AS occupations
        FROM
            volunteer_occupations
        WHERE
            user_id = :userId!) AS occupations ON TRUE
WHERE
    users.id = :userId!;


/* @name updateVolunteerReferenceStatus */
UPDATE
    volunteer_references
SET
    status_id = subquery.id,
    updated_at = NOW()
FROM (
    SELECT
        id
    FROM
        volunteer_reference_statuses
    WHERE
        name = :status!) AS subquery
WHERE
    volunteer_references.id = :referenceId!
RETURNING
    volunteer_references.id AS ok;


/* @name updateVolunteerApproved */
UPDATE
    volunteer_profiles
SET
    approved = TRUE,
    updated_at = NOW()
WHERE
    volunteer_profiles.user_id = :userId!
RETURNING
    volunteer_profiles.user_id AS ok;


/* @name updateVolunteerOnboarded */
UPDATE
    volunteer_profiles
SET
    onboarded = TRUE,
    updated_at = NOW()
WHERE
    volunteer_profiles.user_id = :userId!
RETURNING
    volunteer_profiles.user_id AS ok;


/* @name getVolunteersForNiceToMeetYou */
SELECT
    users.id,
    first_name,
    last_name,
    phone,
    email,
    volunteer_partner_orgs.key AS volunteer_partner_org
FROM
    users
    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
WHERE
    users.banned IS FALSE
    AND users.deactivated IS FALSE
    AND users.test_user IS FALSE
    AND users.created_at >= :start!
    AND users.created_at < :end!;


/* @name getVolunteersForReadyToCoach */
SELECT
    users.id,
    first_name,
    last_name,
    phone,
    email,
    volunteer_partner_orgs.key AS volunteer_partner_org
FROM
    users
    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
    LEFT JOIN user_product_flags ON user_product_flags.user_id = users.id
WHERE
    users.banned IS FALSE
    AND users.deactivated IS FALSE
    AND users.test_user IS FALSE
    AND volunteer_profiles.onboarded IS TRUE
    AND volunteer_profiles.approved IS TRUE
    AND user_product_flags.sent_ready_to_coach_email IS FALSE;


/* @name getVolunteersForWaitingReferences */
SELECT
    users.id,
    users.first_name,
    users.last_name,
    users.phone,
    users.email,
    volunteer_partner_orgs.key AS volunteer_partner_org
FROM
    users
    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
    LEFT JOIN volunteer_references ON volunteer_references.user_id = users.id
    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id
WHERE
    users.banned IS FALSE
    AND users.deactivated IS FALSE
    AND users.test_user IS FALSE
    AND volunteer_reference_statuses.name = 'sent'
    AND volunteer_references.sent_at > :start!
    AND volunteer_references.sent_at < :end!
GROUP BY
    users.id,
    volunteer_partner_orgs.key;


/* @name addVolunteerCertification */
INSERT INTO users_certifications (user_id, certification_id, created_at, updated_at)
SELECT
    :userId!,
    subquery.id,
    NOW(),
    NOW()
FROM (
    SELECT
        certifications.id
    FROM
        certifications
        JOIN quizzes ON quizzes.name = certifications.name
    WHERE
        quizzes.name = :subject!) AS subquery
ON CONFLICT (user_id,
    certification_id)
    DO NOTHING
RETURNING
    user_id AS ok;


/* @name updateVolunteerQuiz */
INSERT INTO users_quizzes AS ins (user_id, quiz_id, attempts, passed, created_at, updated_at)
SELECT
    :userId!,
    subquery.id,
    1,
    :passed!,
    NOW(),
    NOW()
FROM (
    SELECT
        quizzes.id
    FROM
        quizzes
    WHERE
        quizzes.name = :quiz!) AS subquery
ON CONFLICT (user_id,
    quiz_id)
    DO UPDATE SET
        attempts = ins.attempts + 1,
        passed = :passed!,
        updated_at = NOW()
    RETURNING
        user_id AS ok;


/* @name getVolunteersAdminAvailability */
WITH certs_for_subject AS (
    SELECT
        COUNT(*)::int AS total
    FROM
        certification_subject_unlocks
        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
    WHERE
        subjects.name = :subject!
)
SELECT
    users.id
FROM
    users
    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    JOIN (
        SELECT
            users.id,
            COUNT(*)::int AS earned_certs,
            certs_for_subject.total
        FROM
            users_certifications
            JOIN certification_subject_unlocks USING (certification_id)
            JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
            JOIN users ON users.id = users_certifications.user_id
            JOIN certs_for_subject ON TRUE
        WHERE
            subjects.name = :subject!
        GROUP BY
            users.id, subjects.name, certs_for_subject.total
        HAVING
            COUNT(*)::int >= certs_for_subject.total) user_certs ON user_certs.id = users.id
WHERE
    users.test_user IS FALSE
    AND volunteer_profiles.onboarded IS TRUE
    AND users.deactivated IS FALSE
    AND users.banned IS FALSE;


/* @name getVolunteerForTextResponse */
SELECT
    users.id AS volunteer_id,
    sessions.id AS session_id,
    sessions.volunteer_joined_at,
    sessions.ended_at,
    subjects.name AS subject,
    topics.name AS topic
FROM
    users
    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN notifications ON notifications.user_id = users.id
    LEFT JOIN sessions ON sessions.id = notifications.session_id
    LEFT JOIN subjects ON subjects.id = sessions.subject_id
    LEFT JOIN topics ON topics.id = subjects.topic_id
WHERE
    users.phone = :phone!
ORDER BY
    notifications.created_at DESC
LIMIT 1;


/* @name getVolunteersToReview */
SELECT
    users.id,
    users.first_name,
    users.last_name,
    users.email,
    users.created_at,
    MAX(user_actions.created_at) AS ready_for_review_at
FROM
    users
    JOIN volunteer_profiles ON users.id = volunteer_profiles.user_id
    LEFT JOIN photo_id_statuses ON photo_id_statuses.id = volunteer_profiles.photo_id_status
    LEFT JOIN (
        SELECT
            user_id,
            count(*) AS total_references
        FROM
            volunteer_references
            LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id
        WHERE
            NOT volunteer_reference_statuses.name = ANY ('{ "sent", "unsent", "rejected", "removed" }')
        GROUP BY
            user_id) AS reference_count ON reference_count.user_id = users.id
    JOIN volunteer_occupations ON volunteer_occupations.user_id = users.id
    LEFT JOIN user_actions ON user_actions.user_id = users.id
WHERE
    volunteer_profiles.approved IS FALSE
    AND NOT volunteer_profiles.country IS NULL
    AND NOT volunteer_profiles.photo_id_s3_key IS NULL
    AND photo_id_statuses.name = ANY ('{ "submitted", "approved" }')
    AND user_actions.action_type = ANY ('{ "added photo id", "submitted reference form", "completed background info" }')
    AND reference_count.total_references = 2
GROUP BY
    users.id
ORDER BY
    ready_for_review_at
LIMIT (:limit!)::int OFFSET (:offset!)::int;


/* @name getReferencesToFollowup */
SELECT
    users.id AS volunteer_id,
    users.first_name AS volunteer_first_name,
    users.last_name AS volunteer_last_name,
    volunteer_references.id AS reference_id,
    volunteer_references.first_name AS reference_first_name,
    volunteer_references.last_name AS reference_last_name,
    volunteer_references.email AS reference_email
FROM
    users
    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    JOIN volunteer_references ON volunteer_references.user_id = users.id
    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id
WHERE
    users.banned IS FALSE
    AND users.deactivated IS FALSE
    AND users.test_user IS FALSE
    AND volunteer_reference_statuses.name = 'sent'
    AND volunteer_references.sent_at > :start!
    AND volunteer_references.sent_at < :end!;


/* 
 @name updateVolunteerBackgroundInfo
 @param occupation -> ((userId, occupation, createdAt, updatedAt)...)
 */
WITH clear_occ AS (
    DELETE FROM volunteer_occupations
    WHERE user_id = :userId!
),
ins_occ AS (
INSERT INTO volunteer_occupations (user_id, occupation, created_at, updated_at)
        VALUES
            :occupation!
        ON CONFLICT
            DO NOTHING)
        UPDATE
            volunteer_profiles
        SET
            approved = COALESCE(:approved, approved),
            experience = COALESCE(:experience, experience),
            company = COALESCE(:company, company),
            college = COALESCE(:college, college),
            linkedin_url = COALESCE(:linkedInUrl, linkedin_url),
            country = COALESCE(:country, country),
            state = COALESCE(:state, state),
            city = COALESCE(:city, city),
            languages = COALESCE(:languages, languages),
            updated_at = NOW()
        WHERE
            user_id = :userId!
        RETURNING
            user_id AS ok;


/* @name createVolunteerUser */
INSERT INTO users (id, email, phone, first_name, last_name, PASSWORD, verified, referred_by, referral_code, created_at, updated_at)
    VALUES (:userId!, :email!, :phone!, :firstName!, :lastName!, :password!, FALSE, :referredBy, :referralCode!, NOW(), NOW())
ON CONFLICT (email)
    DO NOTHING
RETURNING
    id, email, first_name, last_name, phone, banned, test_user, deactivated, created_at;


/* @name createVolunteerProfile */
INSERT INTO volunteer_profiles (user_id, approved, volunteer_partner_org_id, timezone, created_at, updated_at)
SELECT
    :userId!,
    FALSE,
    subquery.volunteer_partner_org_id,
    :timezone!,
    NOW(),
    NOW()
FROM (
    SELECT
        id AS volunteer_partner_org_id,
        name
    FROM
        volunteer_partner_orgs
    WHERE
        volunteer_partner_orgs.key = :volunteerPartnerOrg) AS subquery
RETURNING
    user_id AS ok;


/* @name getCertificationsForVolunteers */
SELECT
    user_id,
    attempts AS tries,
    users_quizzes.updated_at AS last_attempted_at,
    passed,
    quizzes.name
FROM
    users_quizzes
    JOIN quizzes ON users_quizzes.quiz_id = quizzes.id
WHERE
    user_id = ANY (:userIds!);


/* @name getSubjectsForVolunteer */
WITH subject_cert_total AS (
    SELECT
        subjects.name,
        COUNT(*)::int AS total
    FROM
        certification_subject_unlocks
        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
    GROUP BY
        subjects.name
)
SELECT
    subjects_unlocked.subject
FROM (
    SELECT
        subjects.name AS subject,
        COUNT(*)::int AS earned_certs,
        subject_cert_total.total
    FROM
        users_certifications
        JOIN certification_subject_unlocks USING (certification_id)
        JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
        JOIN subject_cert_total ON subject_cert_total.name = subjects.name
    WHERE
        user_id = :userId!
    GROUP BY
        subjects.name, subject_cert_total.total
    HAVING
        COUNT(*)::int >= subject_cert_total.total) AS subjects_unlocked;


/* @name getNextAnyVolunteerToNotify */
SELECT
    users.id,
    first_name,
    last_name,
    phone,
    email,
    volunteer_partner_orgs.key AS volunteer_partner_org
FROM
    users
    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    JOIN availabilities ON users.id = availabilities.user_id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
    JOIN (
        SELECT
            sub_unlocked.user_id,
            subjects.name AS subject
        FROM (
            SELECT
                user_id,
                subjects.name AS subject,
                COUNT(*)::int AS earned_certs,
                subject_total.total
            FROM
                users_certifications
                JOIN certification_subject_unlocks USING (certification_id)
                JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
                JOIN (
                    SELECT
                        subjects.name, COUNT(*)::int AS total
                    FROM
                        certification_subject_unlocks
                        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
                    GROUP BY
                        subjects.name) AS subject_total ON subject_total.name = subjects.name
                GROUP BY
                    user_id,
                    subjects.name,
                    subject_total.total
                HAVING
                    COUNT(*)::int >= subject_total.total) AS sub_unlocked
                JOIN subjects ON sub_unlocked.subject = subjects.name) AS subjects_unlocked ON subjects_unlocked.user_id = users.id
WHERE
    test_user IS FALSE
    AND banned IS FALSE
    AND deactivated IS FALSE
    AND extract(isodow FROM (now() at time zone availabilities.timezone)) = availabilities.weekday_id
    AND extract(hour FROM (now() at time zone availabilities.timezone)) >= availabilities.available_start
    AND extract(hour FROM (now() at time zone availabilities.timezone)) < availabilities.available_end
    AND subjects_unlocked.subject = :subject!
    AND NOT EXISTS (
        SELECT
            user_id
        FROM
            notifications
        WHERE
            user_id = users.id
            AND sent_at >= DATE(:lastNotified!))
LIMIT 1;

/* @name getNextOpenVolunteerToNotify */
SELECT
    users.id,
    first_name,
    last_name,
    phone,
    email,
    volunteer_partner_orgs.key AS volunteer_partner_org
FROM
    users
    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    JOIN availabilities ON users.id = availabilities.user_id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
    JOIN (
        SELECT
            sub_unlocked.user_id,
            subjects.name AS subject
        FROM (
            SELECT
                user_id,
                subjects.name AS subject,
                COUNT(*)::int AS earned_certs,
                subject_total.total
            FROM
                users_certifications
                JOIN certification_subject_unlocks USING (certification_id)
                JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
                JOIN (
                    SELECT
                        subjects.name, COUNT(*)::int AS total
                    FROM
                        certification_subject_unlocks
                        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
                    GROUP BY
                        subjects.name) AS subject_total ON subject_total.name = subjects.name
                GROUP BY
                    user_id,
                    subjects.name,
                    subject_total.total
                HAVING
                    COUNT(*)::int >= subject_total.total) AS sub_unlocked
                JOIN subjects ON sub_unlocked.subject = subjects.name) AS subjects_unlocked ON subjects_unlocked.user_id = users.id
WHERE
    test_user IS FALSE
    AND banned IS FALSE
    AND deactivated IS FALSE
    AND extract(isodow FROM (now() at time zone availabilities.timezone)) = availabilities.weekday_id
    AND extract(hour FROM (now() at time zone availabilities.timezone)) >= availabilities.available_start
    AND extract(hour FROM (now() at time zone availabilities.timezone)) < availabilities.available_end
    AND subjects_unlocked.subject = :subject!
    AND volunteer_profiles.volunteer_partner_org_id IS NULL
    AND NOT EXISTS (
        SELECT
            user_id
        FROM
            notifications
        WHERE
            user_id = users.id
            AND sent_at >= DATE(:lastNotified!))
LIMIT 1;


/* @name getNextAnyPartnerVolunteerToNotify */
SELECT
    users.id,
    first_name,
    last_name,
    phone,
    email,
    volunteer_partner_orgs.key AS volunteer_partner_org
FROM
    users
    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    JOIN availabilities ON users.id = availabilities.user_id
    JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
    JOIN (
        SELECT
            sub_unlocked.user_id,
            subjects.name AS subject
        FROM (
            SELECT
                user_id,
                subjects.name AS subject,
                COUNT(*)::int AS earned_certs,
                subject_total.total
            FROM
                users_certifications
                JOIN certification_subject_unlocks USING (certification_id)
                JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
                JOIN (
                    SELECT
                        subjects.name, COUNT(*)::int AS total
                    FROM
                        certification_subject_unlocks
                        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
                    GROUP BY
                        subjects.name) AS subject_total ON subject_total.name = subjects.name
                GROUP BY
                    user_id,
                    subjects.name,
                    subject_total.total
                HAVING
                    COUNT(*)::int >= subject_total.total) AS sub_unlocked
                JOIN subjects ON sub_unlocked.subject = subjects.name) AS subjects_unlocked ON subjects_unlocked.user_id = users.id
WHERE
    test_user IS FALSE
    AND banned IS FALSE
    AND deactivated IS FALSE
    AND extract(isodow FROM (now() at time zone availabilities.timezone)) = availabilities.weekday_id
    AND extract(hour FROM (now() at time zone availabilities.timezone)) >= availabilities.available_start
    AND extract(hour FROM (now() at time zone availabilities.timezone)) < availabilities.available_end
    AND subjects_unlocked.subject = :subject!
    AND NOT volunteer_profiles.volunteer_partner_org_id IS NULL
    AND NOT EXISTS (
        SELECT
            user_id
        FROM
            notifications
        WHERE
            user_id = users.id
            AND sent_at >= DATE(:lastNotified!))
LIMIT 1;


/* @name getNextSpecificPartnerVolunteerToNotify */
SELECT
    users.id,
    first_name,
    last_name,
    phone,
    email,
    volunteer_partner_orgs.key AS volunteer_partner_org
FROM
    users
    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    JOIN availabilities ON users.id = availabilities.user_id
    JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
    JOIN (
        SELECT
            sub_unlocked.user_id,
            subjects.name AS subject
        FROM (
            SELECT
                user_id,
                subjects.name AS subject,
                COUNT(*)::int AS earned_certs,
                subject_total.total
            FROM
                users_certifications
                JOIN certification_subject_unlocks USING (certification_id)
                JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
                JOIN (
                    SELECT
                        subjects.name, COUNT(*)::int AS total
                    FROM
                        certification_subject_unlocks
                        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
                    GROUP BY
                        subjects.name) AS subject_total ON subject_total.name = subjects.name
                GROUP BY
                    user_id,
                    subjects.name,
                    subject_total.total
                HAVING
                    COUNT(*)::int >= subject_total.total) AS sub_unlocked
                JOIN subjects ON sub_unlocked.subject = subjects.name) AS subjects_unlocked ON subjects_unlocked.user_id = users.id
WHERE
    test_user IS FALSE
    AND banned IS FALSE
    AND deactivated IS FALSE
    AND extract(isodow FROM (now() at time zone availabilities.timezone)) = availabilities.weekday_id
    AND extract(hour FROM (now() at time zone availabilities.timezone)) >= availabilities.available_start
    AND extract(hour FROM (now() at time zone availabilities.timezone)) < availabilities.available_end
    AND subjects_unlocked.subject = :subject!
    AND volunteer_partner_orgs.key = :volunteerPartnerOrg!
    AND NOT EXISTS (
        SELECT
            user_id
        FROM
            notifications
        WHERE
            user_id = users.id
            AND sent_at >= DATE(:lastNotified!))
LIMIT 1;

/* @name getVolunteerForScheduleUpdate */
SELECT
    users.id,
    volunteer_partner_orgs.key AS volunteer_partner_org,
    volunteer_profiles.onboarded,
    subjects_unlocked.subjects
FROM
    users
    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
    LEFT JOIN LATERAL (
        SELECT
            array_agg(sub_unlocked.subject) AS subjects
        FROM (
            SELECT
                user_id,
                subjects.name AS subject,
                COUNT(*)::int AS earned_certs,
                subject_total.total
            FROM
                users_certifications
                JOIN certification_subject_unlocks USING (certification_id)
                JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
                JOIN (
                    SELECT
                        subjects.name, COUNT(*)::int AS total
                    FROM
                        certification_subject_unlocks
                        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
                    GROUP BY
                        subjects.name) AS subject_total ON subject_total.name = subjects.name
                WHERE users_certifications.user_id = users.id
                GROUP BY
                    user_id,
                    subjects.name,
                    subject_total.total
                HAVING
                    COUNT(*)::int >= subject_total.total) AS sub_unlocked) AS subjects_unlocked ON TRUE
WHERE
    users.id = :userId!
LIMIT 1;

/* @name getVolunteersOnDeck */
SELECT
    users.id,
    first_name,
    last_name,
    phone,
    email,
    volunteer_partner_orgs.key AS volunteer_partner_org
FROM
    users
    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    JOIN availabilities ON users.id = availabilities.user_id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
    JOIN (
        SELECT
            sub_unlocked.user_id,
            subjects.name AS subject
        FROM (
            SELECT
                user_id,
                subjects.name AS subject,
                COUNT(*)::int AS earned_certs,
                subject_total.total
            FROM
                users_certifications
                JOIN certification_subject_unlocks USING (certification_id)
                JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
                JOIN (
                    SELECT
                        subjects.name, COUNT(*)::int AS total
                    FROM
                        certification_subject_unlocks
                        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
                    GROUP BY
                        subjects.name) AS subject_total ON subject_total.name = subjects.name
                GROUP BY
                    user_id,
                    subjects.name,
                    subject_total.total
                HAVING
                    COUNT(*)::int >= subject_total.total) AS sub_unlocked
                JOIN subjects ON sub_unlocked.subject = subjects.name) AS subjects_unlocked ON subjects_unlocked.user_id = users.id
WHERE
    test_user IS FALSE
    AND banned IS FALSE
    AND deactivated IS FALSE
    AND NOT users.id = ANY(:excludedIds!)
    AND extract(isodow FROM (now() at time zone availabilities.timezone)) = availabilities.weekday_id
    AND extract(hour FROM (now() at time zone availabilities.timezone)) >= availabilities.available_start
    AND extract(hour FROM (now() at time zone availabilities.timezone)) < availabilities.available_end
    AND subjects_unlocked.subject = :subject!;

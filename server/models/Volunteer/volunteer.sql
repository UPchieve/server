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
    AND (:banned::boolean IS NULL
        OR (:banned::boolean IS TRUE
            AND users.ban_type = 'complete')
        OR (:banned::boolean IS FALSE
            AND users.ban_type IS DISTINCT FROM 'complete'))
    AND (:deactivated::boolean IS NULL
        OR users.deactivated = :deactivated::boolean)
    AND deleted IS FALSE
    AND (:testUser::boolean IS NULL
        OR users.test_user = :testUser::boolean);


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
    AND users.ban_type IS DISTINCT FROM 'complete'
    AND users.deactivated IS FALSE
    AND users.deleted IS FALSE
    AND users.test_user IS FALSE;


/* TODO: 8-30-22 at Katie O'Connor's request we are excluding corporate partner volunteers
 we may want to remove the final AND condition at a later date */
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
    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
WHERE
    users.last_activity_at < :startDate!
    AND users.banned IS FALSE
    AND users.ban_type IS DISTINCT FROM 'complete'
    AND users.deactivated IS FALSE
    AND users.deleted IS FALSE
    AND users.test_user IS FALSE
    AND volunteer_profiles.onboarded IS TRUE
    AND volunteer_profiles.volunteer_partner_org_id IS NULL;


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
    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
WHERE
    users.id = :userId!
    AND volunteer_profiles.onboarded IS TRUE
    AND users.banned IS FALSE
    AND users.ban_type IS DISTINCT FROM 'complete'
    AND users.deactivated IS FALSE
    AND users.deleted IS FALSE
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
    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
    LEFT JOIN (
        SELECT
            COUNT(*)::int AS total
        FROM
            sessions
        WHERE
            sessions.volunteer_id = :userId) AS total_sessions ON TRUE
WHERE
    users.id = :userId!
    AND volunteer_profiles.onboarded IS TRUE
    AND volunteer_profiles.volunteer_partner_org_id IS NOT NULL
    AND users.banned IS FALSE
    AND users.ban_type IS DISTINCT FROM 'complete'
    AND users.deactivated IS FALSE
    AND users.deleted IS FALSE
    AND total_sessions.total > 0
    AND users.test_user IS FALSE;


/* @name getVolunteersForWeeklyHourSummary */
SELECT
    users.id,
    first_name,
    last_name,
    email,
    volunteer_partner_orgs.key AS volunteer_partner_org,
    sent_hour_summary_intro_email
FROM
    users
    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
    LEFT JOIN user_product_flags ON users.id = user_product_flags.user_id
WHERE (volunteer_partner_orgs.id IS NULL
    OR volunteer_partner_orgs.receive_weekly_hour_summary_email IS TRUE)
AND users.banned IS FALSE
AND users.ban_type IS DISTINCT FROM 'complete'
AND users.deactivated IS FALSE
AND users.deleted IS FALSE
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


/* @name updateTimezoneByUserId */
UPDATE
    volunteer_profiles
SET
    timezone = COALESCE(:timezone, timezone),
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
    JOIN users ON volunteer_profiles.user_id = users.id
WHERE
    users.deactivated IS FALSE
    AND users.deleted IS FALSE
    AND users.test_user IS FALSE
    AND volunteer_profiles.onboarded IS TRUE
    AND volunteer_profiles.approved IS TRUE;


/* @name getVolunteersForTotalHours */
SELECT
    users.id
FROM
    users
    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
    LEFT JOIN user_product_flags ON users.id = user_product_flags.user_id
WHERE
    volunteer_partner_orgs.key = ANY (:targetPartnerOrgs!)
    AND volunteer_profiles.onboarded IS TRUE
    AND volunteer_profiles.approved IS TRUE
    AND users.banned IS FALSE
    AND users.ban_type IS DISTINCT FROM 'complete'
    AND users.deactivated IS FALSE
    AND users.deleted IS FALSE
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
    volunteer_profiles.approved,
    COALESCE(array_agg(subjects_unlocked.subject) FILTER (WHERE subjects_unlocked.subject IS NOT NULL), '{}') AS subjects,
    country,
    MAX(availabilities.updated_at) AS availability_last_modified_at,
    volunteer_partner_orgs.key AS volunteer_partner_org_key
FROM
    users
    LEFT JOIN (
        SELECT
            subjects.name AS subject,
            COUNT(*)::int AS earned_certs
        FROM
            users_certifications
            JOIN certification_subject_unlocks USING (certification_id)
            JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
            JOIN users ON users.id = users_certifications.user_id
            JOIN CTE ON CTE.name = subjects.name
        WHERE
            users.id = :userId
        GROUP BY
            subjects.name, CTE.total) AS subjects_unlocked ON TRUE
    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN availabilities ON availabilities.user_id = users.id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
WHERE
    users.banned IS FALSE
    AND users.ban_type IS DISTINCT FROM 'complete'
    AND (:deactivated::boolean IS NULL
        OR users.deactivated = :deactivated::boolean)
    AND users.deleted IS FALSE
    AND users.test_user IS FALSE
    AND volunteer_profiles.onboarded IS FALSE
    AND users.id = :userId
GROUP BY
    users.id,
    onboarded,
    approved,
    country,
    volunteer_partner_org_key;


/* @name getVolunteersForTelecomReport */
SELECT
    users.id,
    first_name,
    last_name,
    email,
    volunteer_partner_orgs.key AS volunteer_partner_org,
    users.created_at
FROM
    users
    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
WHERE
    volunteer_partner_orgs.key = :partnerOrg!
    AND users.banned IS FALSE
    AND users.ban_type IS DISTINCT FROM 'complete'
    AND users.deactivated IS FALSE
    AND users.deleted IS FALSE
    AND users.test_user IS FALSE
    AND volunteer_profiles.onboarded IS TRUE
    AND volunteer_profiles.approved IS TRUE
GROUP BY
    users.id,
    volunteer_partner_org;


/* @name getVolunteersNotifiedBySessionId */
SELECT
    notifications.user_id
FROM
    notifications
WHERE
    notifications.session_id = :sessionId!;


/* @name getVolunteerByReference */
SELECT
    volunteer_references.user_id AS volunteer_id,
    volunteer_references.email AS reference_email
FROM
    volunteer_references
    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id
WHERE
    volunteer_references.id = :referenceId!
    AND volunteer_reference_statuses.name <> 'removed'
LIMIT 1;


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
RETURNING
    id AS ok;


/* @name updateVolunteerReferenceSubmission */
UPDATE
    volunteer_references
SET
    status_id = subquery.id,
    affiliation = COALESCE(:affiliation, affiliation),
    relationship_length = COALESCE(:relationshipLength, relationship_length),
    rejection_reason = COALESCE(:rejectionReason, rejection_reason),
    additional_info = COALESCE(:additionalInfo, additional_info),
    patient = COALESCE(:patient, patient),
    positive_role_model = COALESCE(:positiveRoleModel, positive_role_model),
    agreeable_and_approachable = COALESCE(:agreeableAndApproachable, agreeable_and_approachable),
    communicates_effectively = COALESCE(:communicatesEffectively, communicates_effectively),
    trustworthy_with_children = COALESCE(:trustworthyWithChildren, trustworthy_with_children),
    updated_at = NOW()
FROM (
    SELECT
        id
    FROM
        volunteer_reference_statuses
    WHERE
        name = 'submitted') AS subquery
WHERE
    volunteer_references.id = :referenceId!
    AND EXISTS (
        SELECT
            1
        FROM
            users
        WHERE
            users.id = volunteer_references.user_id
            AND users.deleted IS FALSE)
RETURNING
    volunteer_references.id AS ok;


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
    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
WHERE
    users.last_activity_at >= :start!
    AND users.last_activity_at < :end!
    AND users.banned IS FALSE
    AND users.ban_type IS DISTINCT FROM 'complete'
    AND users.deactivated IS FALSE
    AND users.deleted IS FALSE
    AND users.test_user IS FALSE
    AND volunteer_profiles.onboarded IS TRUE;


/* @name updateVolunteerReferenceSentById */
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


/* @name setVolunteerElapsedAvailabilityById */
UPDATE
    volunteer_profiles
SET
    elapsed_availability = :elapsedAvailability!::int,
    updated_at = NOW()
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
FROM
    users_training_courses
    LEFT JOIN training_courses ON training_courses.id = users_training_courses.training_course_id
WHERE
    users_training_courses.user_id = :userId!;


/* @name updateVolunteerTrainingById */
INSERT INTO users_training_courses AS ins (user_id, training_course_id, completed_materials, progress, complete, created_at, updated_at)
SELECT
    :userId!,
    training_courses.id,
    ARRAY[(:materialKey!)::text],
    COALESCE(FLOOR(1.0 * array_length(ARRAY (
                    SELECT
                        REPLACE(unnest(ARRAY[:materialKey!::text]), '''', '')
                INTERSECT
                SELECT
                    unnest(:requiredMaterialKeys!::text[])), 1) / array_length(:requiredMaterialKeys!::text[], 1) * 100), 0),
    100 = COALESCE(FLOOR(1.0 * array_length(ARRAY (
                    SELECT
                        REPLACE(unnest(ARRAY[:materialKey!::text]), '''', '')
                INTERSECT
                SELECT
                    unnest(:requiredMaterialKeys!::text[])), 1) / array_length(:requiredMaterialKeys!::text[], 1) * 100), 0),
    NOW(),
    NOW()
FROM
    training_courses
WHERE
    training_courses.name = :trainingCourse!
LIMIT 1
ON CONFLICT (user_id,
    training_course_id)
    DO UPDATE SET
        completed_materials = ARRAY_APPEND(ins.completed_materials, :materialKey!),
        progress = COALESCE(FLOOR(1.0 * array_length(ARRAY (
                        SELECT
                            REPLACE(unnest(ARRAY_APPEND(ins.completed_materials, :materialKey!)), '''', '')
                    INTERSECT
                    SELECT
                        unnest(:requiredMaterialKeys!::text[])), 1) / array_length(:requiredMaterialKeys!::text[], 1) * 100), 0),
        complete = COALESCE(FLOOR(1.0 * array_length(ARRAY (
                        SELECT
                            REPLACE(unnest(ARRAY_APPEND(ins.completed_materials, :materialKey!)), '''', '')
                    INTERSECT
                    SELECT
                        unnest(:requiredMaterialKeys!::text[])), 1) / array_length(:requiredMaterialKeys!::text[], 1) * 100), 0) = 100,
        updated_at = NOW()
    WHERE
        NOT :materialKey! = ANY (ins.completed_materials)
    RETURNING
        *;


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


/* @name getVolunteerUnsentReferences */
SELECT
    vr.id,
    vr.user_id,
    vr.first_name,
    vr.last_name,
    vr.email,
    volunteer_reference_statuses.name AS status
FROM
    volunteer_references vr
    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = vr.status_id
    JOIN users ON vr.user_id = users.id
WHERE
    volunteer_reference_statuses.name = 'unsent'
    AND users.deleted IS FALSE;


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
    volunteer_references.user_id = :userId!
    AND volunteer_reference_statuses.name != 'removed';


/* @name checkReferenceExistsBeforeAdding */
SELECT
    volunteer_references.id,
    first_name,
    last_name,
    email,
    volunteer_reference_statuses.name AS status,
    sub.actions
FROM
    volunteer_references
    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id
    LEFT JOIN (
        SELECT
            array_agg(action) AS actions
        FROM
            user_actions
        WHERE
            user_actions.user_id = :userId!
            AND user_actions.reference_email = :email!) sub ON TRUE
WHERE
    volunteer_references.user_id = :userId!
    AND volunteer_references.email = :email!;


/* @name getReferencesByVolunteerForAdminDetail */
SELECT
    volunteer_references.id,
    first_name,
    last_name,
    email,
    volunteer_reference_statuses.name AS status,
    affiliation,
    relationship_length,
    patient,
    positive_role_model,
    agreeable_and_approachable,
    communicates_effectively,
    rejection_reason,
    additional_info,
    trustworthy_with_children
FROM
    volunteer_references
    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id
WHERE
    volunteer_references.user_id = :userId!
    AND volunteer_reference_statuses.name != 'removed';


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
    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
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


/* @name updateVolunteerPending */
UPDATE
    volunteer_profiles
SET
    approved = :approved!,
    photo_id_status = subquery.id,
    updated_at = NOW()
FROM (
    SELECT
        id
    FROM
        photo_id_statuses
    WHERE
        name = :status!) AS subquery
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
    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
WHERE
    users.banned IS FALSE
    AND users.ban_type IS DISTINCT FROM 'complete'
    AND users.deactivated IS FALSE
    AND users.deleted IS FALSE
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
    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
    LEFT JOIN user_product_flags ON user_product_flags.user_id = users.id
WHERE
    users.banned IS FALSE
    AND users.ban_type IS DISTINCT FROM 'complete'
    AND users.deactivated IS FALSE
    AND users.deleted IS FALSE
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
    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
    LEFT JOIN volunteer_references ON volunteer_references.user_id = users.id
    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id
WHERE
    users.banned IS FALSE
    AND users.ban_type IS DISTINCT FROM 'complete'
    AND users.deactivated IS FALSE
    AND users.deleted IS FALSE
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


/* @name getVolunteersToReview */
SELECT
    users.id,
    users.first_name AS first_name,
    users.last_name AS last_name,
    users.first_name AS firstname,
    users.last_name AS lastname,
    users.email,
    users.created_at,
    MAX(user_actions.created_at) AS ready_for_review_at
FROM
    users
    JOIN volunteer_profiles ON users.id = volunteer_profiles.user_id
    JOIN photo_id_statuses ON photo_id_statuses.id = volunteer_profiles.photo_id_status
    JOIN volunteer_occupations ON volunteer_occupations.user_id = users.id -- user is only ready for review if they submitted background info
    JOIN user_actions ON user_actions.user_id = users.id
WHERE
    volunteer_profiles.approved IS FALSE
    AND NOT volunteer_profiles.country IS NULL
    AND NOT volunteer_profiles.photo_id_s3_key IS NULL
    AND users.ban_type IS NULL
    AND photo_id_statuses.name = ANY ('{ "submitted", "approved" }')
    AND user_actions.action = ANY ('{ "ADDED PHOTO ID", "COMPLETED BACKGROUND INFO" }')
    AND (
        SELECT
            MAX(user_actions.created_at)
        FROM
            user_actions
        WHERE
            action = ANY ('{ "ADDED PHOTO ID", "COMPLETED BACKGROUND INFO" }')
            AND user_id = users.id) > CURRENT_DATE - INTERVAL '3 MONTHS'
GROUP BY
    users.id
ORDER BY
    ready_for_review_at ASC
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
    AND users.ban_type IS DISTINCT FROM 'complete'
    AND users.deactivated IS FALSE
    AND users.deleted IS FALSE
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


/* @name getQuizzesPassedForDateRange */
SELECT
    COUNT(*)::int AS total
FROM
    users_quizzes
WHERE
    user_id = :userId!
    AND updated_at >= :start!
    AND updated_at <= :end!
    AND passed IS TRUE;


/* @name updateVolunteerUserForAdmin */
UPDATE
    users
SET
    first_name = COALESCE(:firstName, first_name),
    last_name = COALESCE(:lastName, last_name),
    email = :email!,
    verified = :isVerified!,
    ban_type = :banType,
    deactivated = :isDeactivated!
WHERE
    users.id = :userId!
RETURNING
    id AS ok;


/* @name updateVolunteerProfilesForAdmin */
UPDATE
    volunteer_profiles
SET
    volunteer_partner_org_id = :partnerOrgId,
    approved = COALESCE(:approved, approved)
WHERE
    user_id = :userId!
RETURNING
    user_id AS ok;


/* @name createVolunteerUser */
INSERT INTO users (id, email, phone, sms_consent, first_name, last_name, PASSWORD, verified, referred_by, referral_code, signup_source_id, other_signup_source, last_activity_at, created_at, updated_at)
    VALUES (:userId!, :email!, :phone!, :smsConsent!, :firstName!, :lastName!, :password!, FALSE, :referredBy, :referralCode!, :signupSourceId, :otherSignupSource, NOW(), NOW(), NOW())
ON CONFLICT (email)
    DO NOTHING
RETURNING
    id, email, first_name, last_name, phone, sms_consent, banned, ban_type, test_user, deactivated, created_at;


/* @name createUserVolunteerPartnerOrgInstance */
INSERT INTO users_volunteer_partner_orgs_instances (user_id, volunteer_partner_org_id, created_at, updated_at)
SELECT
    :userId!,
    vpo.id,
    NOW(),
    NOW()
FROM
    volunteer_partner_orgs vpo
WHERE
    vpo.name = :vpoName!
LIMIT 1
RETURNING
    user_id AS ok;


/* @name createVolunteerProfile */
INSERT INTO volunteer_profiles (user_id, approved, volunteer_partner_org_id, timezone, created_at, updated_at)
    VALUES (:userId!, FALSE, :partnerOrgId, :timezone, NOW(), NOW())
RETURNING
    user_id AS ok;


/* @name getQuizzesForVolunteers */
SELECT
    user_id,
    attempts AS tries,
    users_quizzes.updated_at AS last_attempted_at,
    passed,
    quizzes.name,
    quizzes.active
FROM
    users_quizzes
    JOIN quizzes ON users_quizzes.quiz_id = quizzes.id
WHERE
    user_id = ANY (:userIds!);


/* @name getCertificationsForVolunteer */
SELECT
    user_id,
    users_certifications.updated_at AS last_attempted_at,
    certifications.name,
    certifications.active
FROM
    users_certifications
    JOIN certifications ON users_certifications.certification_id = certifications.id
WHERE
    user_id = ANY (:userIds!);


/* @name getActiveQuizzesForVolunteers */
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
    user_id = ANY (:userIds!)
    AND quizzes.active IS TRUE;


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


/* @name getNextVolunteerToNotify */
WITH subject_totals AS (
    SELECT
        subjects.name,
        COUNT(*)::int AS total
    FROM
        certification_subject_unlocks
        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
    WHERE
        subjects.name = ANY (ARRAY[:subject] || COALESCE(:highLevelSubjects::text[], '{}'))
    GROUP BY
        subjects.name
),
computed_subject_totals AS (
    SELECT
        subjects.name,
        COUNT(*)::int AS total
    FROM
        computed_subject_unlocks
        JOIN subjects ON subjects.id = computed_subject_unlocks.subject_id
    WHERE
        subjects.name = ANY (ARRAY[:subject] || COALESCE(:highLevelSubjects::text[], '{}'))
    GROUP BY
        subjects.name
),
ready_to_tutor_volunteers AS (
    SELECT
        users.id AS userId,
        first_name,
        last_name,
        phone,
        email
    FROM
        users
        JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    WHERE
        test_user IS FALSE
        AND banned IS FALSE
        AND ban_type IS DISTINCT FROM 'complete'
        AND deactivated IS FALSE
        AND deleted IS FALSE
        AND volunteer_profiles.onboarded IS TRUE
        AND volunteer_profiles.approved IS TRUE
        AND ( -- user is not part of disqualified group (like active session volunteers) if provided
            (:disqualifiedVolunteers)::uuid[] IS NULL
            OR NOT users.id = ANY (:disqualifiedVolunteers))
),
-- The above volunteers, narrowed down to those who can tutor in the given subject
volunteers_with_needed_certification AS (
    SELECT
        userId,
        first_name,
        last_name,
        phone,
        email
    FROM
        ready_to_tutor_volunteers
        LEFT JOIN LATERAL (
            SELECT
                array_agg(sub_unlocked.subject)::text[] AS subjects
            FROM (
                SELECT
                    subjects.name AS subject
                FROM
                    users_certifications
                    JOIN certification_subject_unlocks USING (certification_id)
                    JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
                    JOIN subject_totals ON subject_totals.name = subjects.name
                WHERE
                    users_certifications.user_id = userId
                GROUP BY
                    user_id, subjects.name, subject_totals.total) AS sub_unlocked) AS subjects_unlocked ON TRUE
        LEFT JOIN LATERAL (
            SELECT
                array_agg(sub_unlocked.subject)::text[] AS subjects
            FROM (
                SELECT
                    subjects.name AS subject
                FROM
                    users_certifications
                    JOIN computed_subject_unlocks USING (certification_id)
                    JOIN subjects ON computed_subject_unlocks.subject_id = subjects.id
                    JOIN computed_subject_totals ON computed_subject_totals.name = subjects.name
                WHERE
                    users_certifications.user_id = userId
                GROUP BY
                    user_id, subjects.name, computed_subject_totals.total
                HAVING
                    COUNT(*)::int >= computed_subject_totals.total) AS sub_unlocked) AS computed_subjects_unlocked ON TRUE
    WHERE (:subject = ANY (subjects_unlocked.subjects)
        OR :subject = ANY (computed_subjects_unlocked.subjects))
    AND ( -- user does not have high level subjects if provided
        (:highLevelSubjects)::text[] IS NULL
        OR (:highLevelSubjects)::text[] && subjects_unlocked.subjects IS FALSE)
),
-- The above volunteers, narrowed down to those with availability
volunteers_with_availability AS (
    SELECT
        vwnc.userId,
        vwnc.first_name,
        vwnc.last_name,
        vwnc.phone,
        vwnc.email
    FROM
        volunteers_with_needed_certification vwnc
        JOIN availabilities ON userId = availabilities.user_id
        JOIN weekdays ON weekdays.id = availabilities.weekday_id
    WHERE
        -- availabilities are all stored in EST so convert server time to EST to be safe
        TRIM(BOTH FROM to_char(NOW() at time zone 'America/New_York', 'Day')) = weekdays.day
        AND extract(hour FROM (NOW() at time zone 'America/New_York')) >= availabilities.available_start
        AND extract(hour FROM (NOW() at time zone 'America/New_York')) < availabilities.available_end
),
candidates AS (
    SELECT
        vol.userId AS id,
        vol.first_name,
        vol.last_name,
        vol.phone,
        vol.email,
        volunteer_partner_orgs.key AS volunteer_partner_org,
        row_number() OVER () AS rn
FROM
    volunteers_with_availability vol
    JOIN volunteer_profiles ON volunteer_profiles.user_id = vol.userId
        LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
    WHERE ( -- user is a favorite volunteer
        (:favoriteVolunteers)::uuid[] IS NULL
        OR vol.userId = ANY (:favoriteVolunteers))
    AND ( -- user is partner or open
        (:isPartner)::boolean IS NULL
        OR (:isPartner IS FALSE
            AND volunteer_profiles.volunteer_partner_org_id IS NULL)
        OR (:isPartner IS TRUE
            AND NOT volunteer_profiles.volunteer_partner_org_id IS NULL))
    AND ((:specificPartner)::text IS NULL
        OR volunteer_partner_orgs.key = :specificPartner)
    AND NOT EXISTS (
        SELECT
            user_id
        FROM
            notifications
        WHERE
            user_id = vol.userId
            AND sent_at >= :lastNotified)
),
row_count AS (
    SELECT
        max(rn) AS total_rows
FROM
    candidates
),
random_row AS (
    SELECT
        floor(random() * row_count.total_rows + 1) AS random_rn
FROM
    row_count
)
SELECT
    *
FROM
    candidates
WHERE
    rn = (
        SELECT
            random_rn
        FROM
            random_row
        LIMIT 1)
LIMIT 1;


/* @name checkIfVolunteerMutedSubject */
SELECT
    user_id
FROM
    muted_users_subject_alerts
    JOIN subjects ON muted_users_subject_alerts.subject_id = subjects.id
WHERE
    muted_users_subject_alerts.user_id = :userId
    AND subjects.name = :subjectName;


/* @name getVolunteerForScheduleUpdate */
SELECT
    users.id,
    volunteer_partner_orgs.key AS volunteer_partner_org,
    volunteer_profiles.onboarded,
    subjects_unlocked.subjects,
    COALESCE(training_quizzes.passed, FALSE) AS passed_required_training
FROM
    users
    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
    LEFT JOIN LATERAL (
        SELECT
            array_agg(sub_unlocked.subject) AS subjects
        FROM (
            SELECT
                user_id,
                subjects.name AS subject
            FROM
                users_certifications
                JOIN certification_subject_unlocks USING (certification_id)
                JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
            WHERE
                users_certifications.user_id = users.id
            GROUP BY
                user_id, subjects.name) AS sub_unlocked) AS subjects_unlocked ON TRUE
    LEFT JOIN (
        SELECT
            passed,
            user_id
        FROM
            users_quizzes
            JOIN quizzes ON users_quizzes.quiz_id = quizzes.id
        WHERE
            quizzes.name = 'upchieve101') AS training_quizzes ON training_quizzes.user_id = volunteer_profiles.user_id
WHERE
    users.id = :userId!
LIMIT 1;


/* @name getUniqueStudentsHelpedForAnalyticsReportSummary */
SELECT
    COALESCE(COUNT(DISTINCT sessions.student_id), 0)::int AS total_unique_students_helped,
    COALESCE(COUNT(DISTINCT CASE WHEN sessions.created_at >= :start!
                AND sessions.created_at <= :end! THEN
                sessions.student_id
            ELSE
                NULL
            END), 0)::int AS total_unique_students_helped_within_range,
    COALESCE(COUNT(DISTINCT CASE WHEN student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)
                OR student_profiles.school_id = ANY (:studentSchoolIds!) THEN
                sessions.student_id
            ELSE
                NULL
            END), 0)::int AS total_unique_partner_students_helped,
    COALESCE(COUNT(DISTINCT CASE WHEN sessions.created_at >= :start!
                AND sessions.created_at <= :end!
                AND (student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)
                    OR student_profiles.school_id = ANY (:studentSchoolIds!)) THEN
                sessions.student_id
            ELSE
                NULL
            END), 0)::int AS total_unique_partner_students_helped_within_range
FROM
    volunteer_partner_orgs
    LEFT JOIN volunteer_profiles ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
    LEFT JOIN sessions ON volunteer_profiles.user_id = sessions.volunteer_id
    LEFT JOIN student_profiles ON sessions.student_id = student_profiles.user_id
WHERE
    volunteer_partner_orgs.key = :volunteerPartnerOrg!;


/* @name getVolunteersForAnalyticsReport */
SELECT
    users.id AS user_id,
    users.first_name AS first_name,
    users.last_name AS last_name,
    users.email AS email,
    users.created_at AS created_at,
    volunteer_profiles.state AS state,
    volunteer_profiles.onboarded AS is_onboarded,
    user_actions.created_at AS date_onboarded,
    COALESCE(users_quizzes.total, 0) AS total_quizzes_passed,
    availabilities.updated_at AS availability_last_modified_at,
    COALESCE(sessions_stats.total_unique_students_helped, 0) AS total_unique_students_helped,
    COALESCE(sessions_stats.total_unique_students_helped_within_range, 0) AS total_unique_students_helped_within_range,
    COALESCE(sessions_stats.total_unique_partner_students_helped, 0) AS total_unique_partner_students_helped,
    COALESCE(sessions_stats.total_unique_partner_students_helped_within_range, 0) AS total_unique_partner_students_helped_within_range,
    COALESCE(sessions_stats.total_sessions, 0) AS total_sessions,
    COALESCE(sessions_stats.total_sessions_within_range, 0) AS total_sessions_within_range,
    COALESCE(sessions_stats.total_partner_sessions, 0) AS total_partner_sessions,
    COALESCE(sessions_stats.total_partner_sessions_within_range, 0) AS total_partner_sessions_within_range,
    COALESCE(sessions_stats.total_partner_time_tutored, 0) AS total_partner_time_tutored,
    COALESCE(sessions_stats.total_partner_time_tutored_within_range, 0) AS total_partner_time_tutored_within_range,
    COALESCE(notifications_stats.total, 0) AS total_notifications,
    COALESCE(notifications_stats.total_within_range, 0) AS total_notifications_within_range
FROM
    users
    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
    LEFT JOIN volunteer_partner_orgs ON volunteer_profiles.volunteer_partner_org_id = volunteer_partner_orgs.id
    LEFT JOIN (
        SELECT
            COUNT(*)::int AS total,
            user_id
        FROM
            users_quizzes
        WHERE
            passed = TRUE
        GROUP BY
            user_id) AS users_quizzes ON users_quizzes.user_id = volunteer_profiles.user_id
    LEFT JOIN (
        SELECT
            MAX(updated_at) AS updated_at,
            user_id
        FROM
            availabilities
        GROUP BY
            user_id) AS availabilities ON availabilities.user_id = users.id
    LEFT JOIN (
        SELECT
            created_at,
            user_id
        FROM
            user_actions
        WHERE
            action = 'ONBOARDED') AS user_actions ON user_actions.user_id = volunteer_profiles.user_id
    LEFT JOIN LATERAL (
        SELECT
            COUNT(*)::int AS total_sessions,
            COUNT(DISTINCT student_id)::int AS total_unique_students_helped,
            COUNT(DISTINCT CASE WHEN sessions.created_at >= :start!
                    AND sessions.created_at <= :end! THEN
                    student_id
                ELSE
                    NULL
                END)::int AS total_unique_students_helped_within_range,
            COUNT(DISTINCT CASE WHEN student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)
                    OR student_profiles.school_id = ANY (:studentSchoolIds!) THEN
                    sessions.student_id
                ELSE
                    NULL
                END)::int AS total_unique_partner_students_helped,
            COUNT(DISTINCT CASE WHEN sessions.created_at >= :start!
                    AND sessions.created_at <= :end!
                    AND (student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)
                        OR student_profiles.school_id = ANY (:studentSchoolIds!)) THEN
                    sessions.student_id
                ELSE
                    NULL
                END)::int AS total_unique_partner_students_helped_within_range,
            SUM(
                CASE WHEN sessions.created_at >= :start!
                    AND sessions.created_at <= :end! THEN
                    1
                ELSE
                    0
                END)::int AS total_sessions_within_range,
            SUM(
                CASE WHEN student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)
                    OR student_profiles.school_id = ANY (:studentSchoolIds!) THEN
                    1
                ELSE
                    0
                END)::int AS total_partner_sessions,
            SUM(
                CASE WHEN sessions.created_at >= :start!
                    AND sessions.created_at <= :end!
                    AND (student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)
                        OR student_profiles.school_id = ANY (:studentSchoolIds!)) THEN
                    1
                ELSE
                    0
                END)::int AS total_partner_sessions_within_range,
            SUM(
                CASE WHEN student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)
                    OR student_profiles.school_id = ANY (:studentSchoolIds!) THEN
                    sessions.time_tutored
                ELSE
                    0
                END)::bigint AS total_partner_time_tutored,
            SUM(
                CASE WHEN sessions.created_at >= :start!
                    AND sessions.created_at <= :end!
                    AND (student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)
                        OR student_profiles.school_id = ANY (:studentSchoolIds!)) THEN
                    sessions.time_tutored
                ELSE
                    0
                END)::bigint AS total_partner_time_tutored_within_range
        FROM
            sessions
    LEFT JOIN student_profiles ON sessions.student_id = student_profiles.user_id
WHERE
    volunteer_profiles.user_id = sessions.volunteer_id) AS sessions_stats ON TRUE
    LEFT JOIN LATERAL (
        SELECT
            COUNT(*)::int AS total,
            SUM(
                CASE WHEN sent_at >= :start!
                    AND sent_at <= :end! THEN
                    1
                ELSE
                    0
                END)::int AS total_within_range
        FROM
            notifications
    WHERE
        volunteer_profiles.user_id = notifications.user_id) AS notifications_stats ON TRUE
WHERE
    volunteer_partner_orgs.key = :volunteerPartnerOrg!
    AND (:cursor::uuid IS NULL
        OR users.id <= :cursor::uuid)
ORDER BY
    users.id DESC
LIMIT (:pageSize!::int);


/* @name getPartnerOrgsByVolunteer */
SELECT
    vpo.name,
    vpo.id
FROM
    users_volunteer_partner_orgs_instances uvpoi
    JOIN volunteer_partner_orgs vpo ON vpo.id = uvpoi.volunteer_partner_org_id
WHERE
    uvpoi.user_id = :volunteerId!
    AND deactivated_on IS NULL;


/* @name adminDeactivateVolunteerPartnershipInstance */
UPDATE
    users_volunteer_partner_orgs_instances
SET
    deactivated_on = NOW()
WHERE
    user_id = :userId!
    AND volunteer_partner_org_id = :vpoId!
RETURNING
    user_id AS ok;


/* @name adminInsertVolunteerPartnershipInstance */
INSERT INTO users_volunteer_partner_orgs_instances (user_id, volunteer_partner_org_id, created_at, updated_at)
    VALUES (:userId!, :partnerOrgId!, NOW(), NOW())
RETURNING
    user_id AS ok;


/* @name getPartnerOrgByKey */
SELECT
    volunteer_partner_orgs.id AS partner_id,
    volunteer_partner_orgs.key AS partner_key,
    volunteer_partner_orgs.name AS partner_name
FROM
    volunteer_partner_orgs
WHERE
    volunteer_partner_orgs.key = :partnerOrgKey
LIMIT 1;


/* @name getActiveSponsorshipsByUserId */
SELECT
    sponsor_orgs.id,
    sponsor_orgs.name,
    sponsor_orgs.key
FROM
    users_volunteer_partner_orgs_instances
    JOIN sponsor_orgs_volunteer_partner_orgs_instances ON users_volunteer_partner_orgs_instances.volunteer_partner_org_id = sponsor_orgs_volunteer_partner_orgs_instances.volunteer_partner_org_id
    JOIN sponsor_orgs ON sponsor_orgs_volunteer_partner_orgs_instances.sponsor_org_id = sponsor_orgs.id
    JOIN sponsor_orgs_upchieve_instances ON sponsor_orgs.id = sponsor_orgs_upchieve_instances.sponsor_org_id
WHERE
    users_volunteer_partner_orgs_instances.user_id = :userId!
    AND users_volunteer_partner_orgs_instances.deactivated_on IS NULL
    AND sponsor_orgs_volunteer_partner_orgs_instances.deactivated_on IS NULL
    AND sponsor_orgs_upchieve_instances.deactivated_on IS NULL;


/* @name getVolunteerSubjects */
SELECT
    subjects.name,
    subjects.active
FROM
    users_subjects_mview
    JOIN subjects ON subjects.id = users_subjects_mview.subject_id
WHERE
    users_subjects_mview.user_id = :userId!;


/* @name getVolunteerMutedSubjects */
SELECT
    subjects.name,
    subjects.active
FROM
    muted_users_subject_alerts
    JOIN subjects ON subjects.id = muted_users_subject_alerts.subject_id
WHERE
    muted_users_subject_alerts.user_id = :userId!;


/* @name getVolunteersWhoAreOnboardedExceptForAvailability */
SELECT
    u.id,
    u.email,
    u.first_name,
    vp.onboarded,
    vp.approved
FROM
    users u
    JOIN volunteer_profiles vp ON vp.user_id = u.id
    LEFT JOIN user_actions ua ON ua.user_id = u.id
WHERE
    vp.onboarded IS FALSE
    AND u.banned IS FALSE
    AND u.ban_type IS NULL
    AND u.deactivated IS FALSE
    AND u.deleted IS FALSE
    AND EXISTS (
        SELECT
            1
        FROM
            user_actions
        WHERE
            user_id = u.id
            AND action = 'UNLOCKED SUBJECT'
            AND quiz_category <> 'TRAINING')
    AND EXISTS (
        SELECT
            1
        FROM
            user_actions
        WHERE
            user_id = u.id
            AND action = 'PASSED QUIZ'
            AND quiz_category = 'TRAINING')
GROUP BY
    u.id,
    u.email,
    u.first_name,
    vp.onboarded,
    vp.approved;


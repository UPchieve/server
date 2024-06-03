"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuizzesPassedForDateRange = exports.updateVolunteerBackgroundInfo = exports.getReferencesToFollowup = exports.getVolunteersToReview = exports.getVolunteerForTextResponse = exports.updateVolunteerQuiz = exports.addVolunteerCertification = exports.getVolunteersForWaitingReferences = exports.getVolunteersForReadyToCoach = exports.getVolunteersForNiceToMeetYou = exports.updateVolunteerOnboarded = exports.updateVolunteerPending = exports.updateVolunteerApproved = exports.updateVolunteerReferenceStatus = exports.getVolunteerForPendingStatus = exports.getReferencesByVolunteerForAdminDetail = exports.checkReferenceExistsBeforeAdding = exports.getReferencesByVolunteer = exports.getReferencesForReferenceFormApology = exports.getVolunteerUnsentReferences = exports.updateVolunteerSentInactive90DayEmail = exports.updateVolunteerSentInactive60DayEmail = exports.updateVolunteerSentInactive30DayEmail = exports.updateVolunteerPhotoIdById = exports.updateVolunteerTrainingById = exports.getVolunteerTrainingCourses = exports.updateVolunteerTotalHoursById = exports.updateVolunteerElapsedAvailabilityById = exports.updateVolunteersReadyToCoachByIds = exports.deleteVolunteerReferenceById = exports.updateVolunteerReferenceStatusById = exports.updateVolunteerReferenceSentById = exports.getInactiveVolunteers = exports.updateVolunteerReferenceSubmission = exports.addVolunteerReferenceById = exports.getVolunteerByReference = exports.getVolunteersNotifiedBySessionId = exports.getVolunteersNotifiedSinceDate = exports.getVolunteersForTelecomReport = exports.getVolunteerForOnboardingById = exports.getVolunteersForTotalHours = exports.getVolunteerIdsForElapsedAvailability = exports.updateVolunteerThroughAvailability = exports.updateVolunteerHourSummaryIntroById = exports.getVolunteersForWeeklyHourSummary = exports.getPartnerVolunteerForLowHours = exports.getVolunteerForQuickTips = exports.getVolunteersForBlackoutOver = exports.getVolunteerContactInfoByIds = exports.getVolunteerContactInfoById = void 0;
exports.getPartnerOrgByKey = exports.adminInsertVolunteerPartnershipInstance = exports.adminDeactivateVolunteerPartnershipInstance = exports.getPartnerOrgsByVolunteer = exports.removeOnboardedStatusForUnqualifiedVolunteers = exports.getVolunteersForAnalyticsReport = exports.getUniqueStudentsHelpedForAnalyticsReportSummary = exports.getVolunteersOnDeck = exports.getVolunteerForScheduleUpdate = exports.checkIfVolunteerMutedSubject = exports.getNextVolunteerToNotify = exports.getSubjectsForVolunteer = exports.getActiveQuizzesForVolunteers = exports.getCertificationsForVolunteer = exports.getQuizzesForVolunteers = exports.createVolunteerProfile = exports.createUserVolunteerPartnerOrgInstance = exports.createVolunteerUser = exports.updateVolunteerProfilesForAdmin = exports.updateVolunteerUserForAdmin = void 0;
/** Types generated for queries found in "server/models/Volunteer/volunteer.sql" */
const query_1 = require("@pgtyped/query");
const getVolunteerContactInfoByIdIR = { "name": "getVolunteerContactInfoById", "params": [{ "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 393, "b": 399, "line": 14, "col": 16 }] } }], "usedParamSet": { "userId": true }, "statement": { "body": "SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE\n    users.id = :userId!\n    AND users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE", "loc": { "a": 40, "b": 497, "line": 2, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     last_name,
 *     phone,
 *     email,
 *     volunteer_partner_orgs.key AS volunteer_partner_org
 * FROM
 *     users
 *     LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 * WHERE
 *     users.id = :userId!
 *     AND users.banned IS FALSE
 *     AND users.deactivated IS FALSE
 *     AND users.test_user IS FALSE
 * ```
 */
exports.getVolunteerContactInfoById = new query_1.PreparedQuery(getVolunteerContactInfoByIdIR);
const getVolunteerContactInfoByIdsIR = { "name": "getVolunteerContactInfoByIds", "params": [{ "name": "userIds", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 901, "b": 908, "line": 33, "col": 21 }] } }], "usedParamSet": { "userIds": true }, "statement": { "body": "SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE\n    users.id = ANY (:userIds!)\n    AND users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE                                                                                                                                                            ", "loc": { "a": 543, "b": 1007, "line": 21, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     last_name,
 *     phone,
 *     email,
 *     volunteer_partner_orgs.key AS volunteer_partner_org
 * FROM
 *     users
 *     LEFT JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 * WHERE
 *     users.id = ANY (:userIds!)
 *     AND users.banned IS FALSE
 *     AND users.deactivated IS FALSE
 *     AND users.test_user IS FALSE
 * ```
 */
exports.getVolunteerContactInfoByIds = new query_1.PreparedQuery(getVolunteerContactInfoByIdsIR);
const getVolunteersForBlackoutOverIR = { "name": "getVolunteersForBlackoutOver", "params": [{ "name": "startDate", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 1572, "b": 1581, "line": 54, "col": 30 }] } }], "usedParamSet": { "startDate": true }, "statement": { "body": "SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE\n    users.last_activity_at < :startDate!\n    AND users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND volunteer_profiles.onboarded IS TRUE\n    AND volunteer_profiles.volunteer_partner_org_id IS NULL", "loc": { "a": 1210, "b": 1784, "line": 42, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     last_name,
 *     phone,
 *     email,
 *     volunteer_partner_orgs.key AS volunteer_partner_org
 * FROM
 *     users
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 * WHERE
 *     users.last_activity_at < :startDate!
 *     AND users.banned IS FALSE
 *     AND users.deactivated IS FALSE
 *     AND users.test_user IS FALSE
 *     AND volunteer_profiles.onboarded IS TRUE
 *     AND volunteer_profiles.volunteer_partner_org_id IS NULL
 * ```
 */
exports.getVolunteersForBlackoutOver = new query_1.PreparedQuery(getVolunteersForBlackoutOverIR);
const getVolunteerForQuickTipsIR = { "name": "getVolunteerForQuickTips", "params": [{ "name": "userId", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 2176, "b": 2181, "line": 74, "col": 25 }] } }, { "name": "mongoUserId", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 2214, "b": 2224, "line": 75, "col": 31 }] } }], "usedParamSet": { "userId": true, "mongoUserId": true }, "statement": { "body": "SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE (users.id::uuid = :userId\n    OR users.mongo_id::text = :mongoUserId)\nAND volunteer_profiles.onboarded IS TRUE\nAND users.banned IS FALSE\nAND users.deactivated IS FALSE\nAND users.test_user IS FALSE", "loc": { "a": 1825, "b": 2352, "line": 63, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     last_name,
 *     phone,
 *     email,
 *     volunteer_partner_orgs.key AS volunteer_partner_org
 * FROM
 *     users
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 * WHERE (users.id::uuid = :userId
 *     OR users.mongo_id::text = :mongoUserId)
 * AND volunteer_profiles.onboarded IS TRUE
 * AND users.banned IS FALSE
 * AND users.deactivated IS FALSE
 * AND users.test_user IS FALSE
 * ```
 */
exports.getVolunteerForQuickTips = new query_1.PreparedQuery(getVolunteerForQuickTipsIR);
const getPartnerVolunteerForLowHoursIR = { "name": "getPartnerVolunteerForLowHours", "params": [{ "name": "userId", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 2877, "b": 2882, "line": 100, "col": 37 }, { "a": 2936, "b": 2941, "line": 101, "col": 25 }] } }, { "name": "mongoUserId", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 2974, "b": 2984, "line": 102, "col": 31 }] } }], "usedParamSet": { "userId": true, "mongoUserId": true }, "statement": { "body": "SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN (\n        SELECT\n            COUNT(*)::int AS total\n        FROM\n            sessions\n        WHERE\n            sessions.volunteer_id = :userId) AS total_sessions ON TRUE\nWHERE (users.id::uuid = :userId\n    OR users.mongo_id::text = :mongoUserId)\nAND volunteer_profiles.onboarded IS TRUE\nAND volunteer_profiles.volunteer_partner_org_id IS NOT NULL\nAND users.banned IS FALSE\nAND users.deactivated IS FALSE\nAND total_sessions.total > 0\nAND users.test_user IS FALSE", "loc": { "a": 2400, "b": 3201, "line": 83, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     last_name,
 *     phone,
 *     email,
 *     volunteer_partner_orgs.key AS volunteer_partner_org
 * FROM
 *     users
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 *     LEFT JOIN (
 *         SELECT
 *             COUNT(*)::int AS total
 *         FROM
 *             sessions
 *         WHERE
 *             sessions.volunteer_id = :userId) AS total_sessions ON TRUE
 * WHERE (users.id::uuid = :userId
 *     OR users.mongo_id::text = :mongoUserId)
 * AND volunteer_profiles.onboarded IS TRUE
 * AND volunteer_profiles.volunteer_partner_org_id IS NOT NULL
 * AND users.banned IS FALSE
 * AND users.deactivated IS FALSE
 * AND total_sessions.total > 0
 * AND users.test_user IS FALSE
 * ```
 */
exports.getPartnerVolunteerForLowHours = new query_1.PreparedQuery(getPartnerVolunteerForLowHoursIR);
const getVolunteersForWeeklyHourSummaryIR = { "name": "getVolunteersForWeeklyHourSummary", "params": [], "usedParamSet": {}, "statement": { "body": "SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    sent_hour_summary_intro_email\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN user_product_flags ON users.id = user_product_flags.user_id\nWHERE (volunteer_partner_orgs.id IS NULL\n    OR volunteer_partner_orgs.receive_weekly_hour_summary_email IS TRUE)\nAND users.banned IS FALSE\nAND users.deactivated IS FALSE\nAND users.test_user IS FALSE\nGROUP BY\n    users.id,\n    volunteer_partner_org,\n    sent_hour_summary_intro_email", "loc": { "a": 3252, "b": 3969, "line": 112, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     last_name,
 *     phone,
 *     email,
 *     volunteer_partner_orgs.key AS volunteer_partner_org,
 *     sent_hour_summary_intro_email
 * FROM
 *     users
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 *     LEFT JOIN user_product_flags ON users.id = user_product_flags.user_id
 * WHERE (volunteer_partner_orgs.id IS NULL
 *     OR volunteer_partner_orgs.receive_weekly_hour_summary_email IS TRUE)
 * AND users.banned IS FALSE
 * AND users.deactivated IS FALSE
 * AND users.test_user IS FALSE
 * GROUP BY
 *     users.id,
 *     volunteer_partner_org,
 *     sent_hour_summary_intro_email
 * ```
 */
exports.getVolunteersForWeeklyHourSummary = new query_1.PreparedQuery(getVolunteersForWeeklyHourSummaryIR);
const updateVolunteerHourSummaryIntroByIdIR = { "name": "updateVolunteerHourSummaryIntroById", "params": [{ "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 4142, "b": 4148, "line": 143, "col": 15 }] } }], "usedParamSet": { "userId": true }, "statement": { "body": "UPDATE\n    user_product_flags\nSET\n    sent_hour_summary_intro_email = TRUE,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok", "loc": { "a": 4022, "b": 4176, "line": 137, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     user_product_flags
 * SET
 *     sent_hour_summary_intro_email = TRUE,
 *     updated_at = NOW()
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
exports.updateVolunteerHourSummaryIntroById = new query_1.PreparedQuery(updateVolunteerHourSummaryIntroByIdIR);
const updateVolunteerThroughAvailabilityIR = { "name": "updateVolunteerThroughAvailability", "params": [{ "name": "timezone", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 4287, "b": 4294, "line": 152, "col": 25 }] } }, { "name": "onboarded", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 4334, "b": 4342, "line": 153, "col": 26 }] } }, { "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 4401, "b": 4407, "line": 156, "col": 15 }] } }], "usedParamSet": { "timezone": true, "onboarded": true, "userId": true }, "statement": { "body": "UPDATE\n    volunteer_profiles\nSET\n    timezone = COALESCE(:timezone, timezone),\n    onboarded = COALESCE(:onboarded, onboarded),\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok", "loc": { "a": 4228, "b": 4435, "line": 149, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     volunteer_profiles
 * SET
 *     timezone = COALESCE(:timezone, timezone),
 *     onboarded = COALESCE(:onboarded, onboarded),
 *     updated_at = NOW()
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
exports.updateVolunteerThroughAvailability = new query_1.PreparedQuery(updateVolunteerThroughAvailabilityIR);
const getVolunteerIdsForElapsedAvailabilityIR = { "name": "getVolunteerIdsForElapsedAvailability", "params": [], "usedParamSet": {}, "statement": { "body": "SELECT\n    user_id\nFROM\n    volunteer_profiles\n    JOIN users ON volunteer_profiles.user_id = users.id\nWHERE\n    users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND volunteer_profiles.onboarded IS TRUE\n    AND volunteer_profiles.approved IS TRUE", "loc": { "a": 4490, "b": 4750, "line": 162, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     user_id
 * FROM
 *     volunteer_profiles
 *     JOIN users ON volunteer_profiles.user_id = users.id
 * WHERE
 *     users.deactivated IS FALSE
 *     AND users.test_user IS FALSE
 *     AND volunteer_profiles.onboarded IS TRUE
 *     AND volunteer_profiles.approved IS TRUE
 * ```
 */
exports.getVolunteerIdsForElapsedAvailability = new query_1.PreparedQuery(getVolunteerIdsForElapsedAvailabilityIR);
const getVolunteersForTotalHoursIR = { "name": "getVolunteersForTotalHours", "params": [{ "name": "targetPartnerOrgs", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 5129, "b": 5146, "line": 183, "col": 39 }] } }], "usedParamSet": { "targetPartnerOrgs": true }, "statement": { "body": "SELECT\n    users.id\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN user_product_flags ON users.id = user_product_flags.user_id\nWHERE\n    volunteer_partner_orgs.key = ANY (:targetPartnerOrgs!)\n    AND volunteer_profiles.onboarded IS TRUE\n    AND volunteer_profiles.approved IS TRUE\n    AND users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\nGROUP BY\n    users.id", "loc": { "a": 4794, "b": 5356, "line": 175, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id
 * FROM
 *     users
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 *     LEFT JOIN user_product_flags ON users.id = user_product_flags.user_id
 * WHERE
 *     volunteer_partner_orgs.key = ANY (:targetPartnerOrgs!)
 *     AND volunteer_profiles.onboarded IS TRUE
 *     AND volunteer_profiles.approved IS TRUE
 *     AND users.banned IS FALSE
 *     AND users.deactivated IS FALSE
 *     AND users.test_user IS FALSE
 * GROUP BY
 *     users.id
 * ```
 */
exports.getVolunteersForTotalHours = new query_1.PreparedQuery(getVolunteersForTotalHoursIR);
const getVolunteerForOnboardingByIdIR = { "name": "getVolunteerForOnboardingById", "params": [{ "name": "userId", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 6419, "b": 6424, "line": 225, "col": 30 }, { "a": 6869, "b": 6874, "line": 236, "col": 27 }] } }, { "name": "mongoUserId", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 6465, "b": 6475, "line": 226, "col": 39 }, { "a": 6911, "b": 6921, "line": 237, "col": 35 }] } }], "usedParamSet": { "userId": true, "mongoUserId": true }, "statement": { "body": "WITH CTE AS (\n    SELECT\n        subjects.name,\n        COUNT(*)::int AS total\n    FROM\n        certification_subject_unlocks\n        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n    GROUP BY\n        subjects.name\n)\nSELECT\n    users.id,\n    email,\n    first_name,\n    volunteer_profiles.onboarded,\n    COALESCE(array_agg(subjects_unlocked.subject) FILTER (WHERE subjects_unlocked.subject IS NOT NULL), '{}') AS subjects,\n    country,\n    MAX(availabilities.updated_at) AS availability_last_modified_at\nFROM\n    users\n    LEFT JOIN (\n        SELECT\n            subjects.name AS subject,\n            COUNT(*)::int AS earned_certs\n        FROM\n            users_certifications\n            JOIN certification_subject_unlocks USING (certification_id)\n            JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n            JOIN users ON users.id = users_certifications.user_id\n            JOIN CTE ON CTE.name = subjects.name\n        WHERE\n            users.id::uuid = :userId\n            OR users.mongo_id::text = :mongoUserId\n        GROUP BY\n            subjects.name, CTE.total) AS subjects_unlocked ON TRUE\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN availabilities ON availabilities.user_id = users.id\nWHERE\n    users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND volunteer_profiles.onboarded IS FALSE\n    AND (users.id::uuid = :userId\n        OR users.mongo_id::text = :mongoUserId)\nGROUP BY\n    users.id,\n    onboarded,\n    country", "loc": { "a": 5403, "b": 6972, "line": 194, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * WITH CTE AS (
 *     SELECT
 *         subjects.name,
 *         COUNT(*)::int AS total
 *     FROM
 *         certification_subject_unlocks
 *         JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
 *     GROUP BY
 *         subjects.name
 * )
 * SELECT
 *     users.id,
 *     email,
 *     first_name,
 *     volunteer_profiles.onboarded,
 *     COALESCE(array_agg(subjects_unlocked.subject) FILTER (WHERE subjects_unlocked.subject IS NOT NULL), '{}') AS subjects,
 *     country,
 *     MAX(availabilities.updated_at) AS availability_last_modified_at
 * FROM
 *     users
 *     LEFT JOIN (
 *         SELECT
 *             subjects.name AS subject,
 *             COUNT(*)::int AS earned_certs
 *         FROM
 *             users_certifications
 *             JOIN certification_subject_unlocks USING (certification_id)
 *             JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
 *             JOIN users ON users.id = users_certifications.user_id
 *             JOIN CTE ON CTE.name = subjects.name
 *         WHERE
 *             users.id::uuid = :userId
 *             OR users.mongo_id::text = :mongoUserId
 *         GROUP BY
 *             subjects.name, CTE.total) AS subjects_unlocked ON TRUE
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN availabilities ON availabilities.user_id = users.id
 * WHERE
 *     users.banned IS FALSE
 *     AND users.deactivated IS FALSE
 *     AND users.test_user IS FALSE
 *     AND volunteer_profiles.onboarded IS FALSE
 *     AND (users.id::uuid = :userId
 *         OR users.mongo_id::text = :mongoUserId)
 * GROUP BY
 *     users.id,
 *     onboarded,
 *     country
 * ```
 */
exports.getVolunteerForOnboardingById = new query_1.PreparedQuery(getVolunteerForOnboardingByIdIR);
const getVolunteersForTelecomReportIR = { "name": "getVolunteersForTelecomReport", "params": [{ "name": "partnerOrg", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 7396, "b": 7406, "line": 257, "col": 34 }] } }], "usedParamSet": { "partnerOrg": true }, "statement": { "body": "SELECT\n    users.id,\n    first_name,\n    last_name,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    users.created_at\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE\n    volunteer_partner_orgs.key = :partnerOrg!\n    AND users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND volunteer_profiles.onboarded IS TRUE\n    AND volunteer_profiles.approved IS TRUE\nGROUP BY\n    users.id,\n    volunteer_partner_org", "loc": { "a": 7019, "b": 7642, "line": 245, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     last_name,
 *     email,
 *     volunteer_partner_orgs.key AS volunteer_partner_org,
 *     users.created_at
 * FROM
 *     users
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 * WHERE
 *     volunteer_partner_orgs.key = :partnerOrg!
 *     AND users.banned IS FALSE
 *     AND users.deactivated IS FALSE
 *     AND users.test_user IS FALSE
 *     AND volunteer_profiles.onboarded IS TRUE
 *     AND volunteer_profiles.approved IS TRUE
 * GROUP BY
 *     users.id,
 *     volunteer_partner_org
 * ```
 */
exports.getVolunteersForTelecomReport = new query_1.PreparedQuery(getVolunteersForTelecomReportIR);
const getVolunteersNotifiedSinceDateIR = { "name": "getVolunteersNotifiedSinceDate", "params": [{ "name": "sinceDate", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 7852, "b": 7861, "line": 277, "col": 34 }] } }], "usedParamSet": { "sinceDate": true }, "statement": { "body": "SELECT\n    users.id\nFROM\n    users\n    LEFT JOIN notifications ON users.id = notifications.user_id\nGROUP BY\n    users.id\nHAVING\n    MAX(notifications.sent_at) > :sinceDate!", "loc": { "a": 7690, "b": 7861, "line": 269, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id
 * FROM
 *     users
 *     LEFT JOIN notifications ON users.id = notifications.user_id
 * GROUP BY
 *     users.id
 * HAVING
 *     MAX(notifications.sent_at) > :sinceDate!
 * ```
 */
exports.getVolunteersNotifiedSinceDate = new query_1.PreparedQuery(getVolunteersNotifiedSinceDateIR);
const getVolunteersNotifiedBySessionIdIR = { "name": "getVolunteersNotifiedBySessionId", "params": [{ "name": "sessionId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 8005, "b": 8014, "line": 286, "col": 32 }] } }], "usedParamSet": { "sessionId": true }, "statement": { "body": "SELECT\n    notifications.user_id\nFROM\n    notifications\nWHERE\n    notifications.session_id = :sessionId!", "loc": { "a": 7911, "b": 8014, "line": 281, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     notifications.user_id
 * FROM
 *     notifications
 * WHERE
 *     notifications.session_id = :sessionId!
 * ```
 */
exports.getVolunteersNotifiedBySessionId = new query_1.PreparedQuery(getVolunteersNotifiedBySessionIdIR);
const getVolunteerByReferenceIR = { "name": "getVolunteerByReference", "params": [{ "name": "referenceId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 8340, "b": 8351, "line": 297, "col": 31 }] } }], "usedParamSet": { "referenceId": true }, "statement": { "body": "SELECT\n    volunteer_references.user_id AS volunteer_id,\n    volunteer_references.email AS reference_email\nFROM\n    volunteer_references\n    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\nWHERE\n    volunteer_references.id = :referenceId!\n    AND volunteer_reference_statuses.name <> 'removed'\nLIMIT 1", "loc": { "a": 8055, "b": 8414, "line": 290, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     volunteer_references.user_id AS volunteer_id,
 *     volunteer_references.email AS reference_email
 * FROM
 *     volunteer_references
 *     LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id
 * WHERE
 *     volunteer_references.id = :referenceId!
 *     AND volunteer_reference_statuses.name <> 'removed'
 * LIMIT 1
 * ```
 */
exports.getVolunteerByReference = new query_1.PreparedQuery(getVolunteerByReferenceIR);
const addVolunteerReferenceByIdIR = { "name": "addVolunteerReferenceById", "params": [{ "name": "id", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 8581, "b": 8583, "line": 305, "col": 5 }] } }, { "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 8591, "b": 8597, "line": 306, "col": 5 }] } }, { "name": "firstName", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 8605, "b": 8614, "line": 307, "col": 5 }] } }, { "name": "lastName", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 8622, "b": 8630, "line": 308, "col": 5 }] } }, { "name": "email", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 8638, "b": 8643, "line": 309, "col": 5 }] } }], "usedParamSet": { "id": true, "userId": true, "firstName": true, "lastName": true, "email": true }, "statement": { "body": "INSERT INTO volunteer_references (id, user_id, first_name, last_name, email, status_id, created_at, updated_at)\nSELECT\n    :id!,\n    :userId!,\n    :firstName!,\n    :lastName!,\n    :email!,\n    volunteer_reference_statuses.id,\n    NOW(),\n    NOW()\nFROM\n    volunteer_reference_statuses\nWHERE\n    name = 'unsent'::text\nRETURNING\n    id AS ok", "loc": { "a": 8457, "b": 8795, "line": 303, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO volunteer_references (id, user_id, first_name, last_name, email, status_id, created_at, updated_at)
 * SELECT
 *     :id!,
 *     :userId!,
 *     :firstName!,
 *     :lastName!,
 *     :email!,
 *     volunteer_reference_statuses.id,
 *     NOW(),
 *     NOW()
 * FROM
 *     volunteer_reference_statuses
 * WHERE
 *     name = 'unsent'::text
 * RETURNING
 *     id AS ok
 * ```
 */
exports.addVolunteerReferenceById = new query_1.PreparedQuery(addVolunteerReferenceByIdIR);
const updateVolunteerReferenceSubmissionIR = { "name": "updateVolunteerReferenceSubmission", "params": [{ "name": "affiliation", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 8940, "b": 8950, "line": 326, "col": 28 }] } }, { "name": "relationshipLength", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 9003, "b": 9020, "line": 327, "col": 36 }] } }, { "name": "rejectionReason", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 9078, "b": 9092, "line": 328, "col": 33 }] } }, { "name": "additionalInfo", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 9146, "b": 9159, "line": 329, "col": 32 }] } }, { "name": "patient", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 9204, "b": 9210, "line": 330, "col": 24 }] } }, { "name": "positiveRoleModel", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 9259, "b": 9275, "line": 331, "col": 36 }] } }, { "name": "agreeableAndApproachable", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 9343, "b": 9366, "line": 332, "col": 43 }] } }, { "name": "communicatesEffectively", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 9439, "b": 9461, "line": 333, "col": 41 }] } }, { "name": "trustworthyWithChildren", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 9533, "b": 9555, "line": 334, "col": 42 }] } }, { "name": "referenceId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 9771, "b": 9782, "line": 344, "col": 31 }] } }], "usedParamSet": { "affiliation": true, "relationshipLength": true, "rejectionReason": true, "additionalInfo": true, "patient": true, "positiveRoleModel": true, "agreeableAndApproachable": true, "communicatesEffectively": true, "trustworthyWithChildren": true, "referenceId": true }, "statement": { "body": "UPDATE\n    volunteer_references\nSET\n    status_id = subquery.id,\n    affiliation = COALESCE(:affiliation, affiliation),\n    relationship_length = COALESCE(:relationshipLength, relationship_length),\n    rejection_reason = COALESCE(:rejectionReason, rejection_reason),\n    additional_info = COALESCE(:additionalInfo, additional_info),\n    patient = COALESCE(:patient, patient),\n    positive_role_model = COALESCE(:positiveRoleModel, positive_role_model),\n    agreeable_and_approachable = COALESCE(:agreeableAndApproachable, agreeable_and_approachable),\n    communicates_effectively = COALESCE(:communicatesEffectively, communicates_effectively),\n    trustworthy_with_children = COALESCE(:trustworthyWithChildren, trustworthy_with_children),\n    updated_at = NOW()\nFROM (\n    SELECT\n        id\n    FROM\n        volunteer_reference_statuses\n    WHERE\n        name = 'submitted') AS subquery\nWHERE\n    volunteer_references.id = :referenceId!\nRETURNING\n    volunteer_references.id AS ok", "loc": { "a": 8847, "b": 9826, "line": 322, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     volunteer_references
 * SET
 *     status_id = subquery.id,
 *     affiliation = COALESCE(:affiliation, affiliation),
 *     relationship_length = COALESCE(:relationshipLength, relationship_length),
 *     rejection_reason = COALESCE(:rejectionReason, rejection_reason),
 *     additional_info = COALESCE(:additionalInfo, additional_info),
 *     patient = COALESCE(:patient, patient),
 *     positive_role_model = COALESCE(:positiveRoleModel, positive_role_model),
 *     agreeable_and_approachable = COALESCE(:agreeableAndApproachable, agreeable_and_approachable),
 *     communicates_effectively = COALESCE(:communicatesEffectively, communicates_effectively),
 *     trustworthy_with_children = COALESCE(:trustworthyWithChildren, trustworthy_with_children),
 *     updated_at = NOW()
 * FROM (
 *     SELECT
 *         id
 *     FROM
 *         volunteer_reference_statuses
 *     WHERE
 *         name = 'submitted') AS subquery
 * WHERE
 *     volunteer_references.id = :referenceId!
 * RETURNING
 *     volunteer_references.id AS ok
 * ```
 */
exports.updateVolunteerReferenceSubmission = new query_1.PreparedQuery(updateVolunteerReferenceSubmissionIR);
const getInactiveVolunteersIR = { "name": "getInactiveVolunteers", "params": [{ "name": "start", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 10228, "b": 10233, "line": 362, "col": 31 }] } }, { "name": "end", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 10269, "b": 10272, "line": 363, "col": 34 }] } }], "usedParamSet": { "start": true, "end": true }, "statement": { "body": "SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE\n    users.last_activity_at >= :start!\n    AND users.last_activity_at < :end!\n    AND users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND volunteer_profiles.onboarded IS TRUE", "loc": { "a": 9865, "b": 10415, "line": 350, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     last_name,
 *     phone,
 *     email,
 *     volunteer_partner_orgs.key AS volunteer_partner_org
 * FROM
 *     users
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 * WHERE
 *     users.last_activity_at >= :start!
 *     AND users.last_activity_at < :end!
 *     AND users.banned IS FALSE
 *     AND users.deactivated IS FALSE
 *     AND users.test_user IS FALSE
 *     AND volunteer_profiles.onboarded IS TRUE
 * ```
 */
exports.getInactiveVolunteers = new query_1.PreparedQuery(getInactiveVolunteersIR);
const updateVolunteerReferenceSentByIdIR = { "name": "updateVolunteerReferenceSentById", "params": [{ "name": "referenceId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 10731, "b": 10742, "line": 385, "col": 31 }] } }], "usedParamSet": { "referenceId": true }, "statement": { "body": "UPDATE\n    volunteer_references\nSET\n    status_id = subquery.id,\n    sent_at = NOW(),\n    updated_at = NOW()\nFROM (\n    SELECT\n        id\n    FROM\n        volunteer_reference_statuses\n    WHERE\n        name = 'sent') AS subquery\nWHERE\n    volunteer_references.id = :referenceId!\nRETURNING\n    volunteer_references.id AS ok", "loc": { "a": 10465, "b": 10786, "line": 371, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     volunteer_references
 * SET
 *     status_id = subquery.id,
 *     sent_at = NOW(),
 *     updated_at = NOW()
 * FROM (
 *     SELECT
 *         id
 *     FROM
 *         volunteer_reference_statuses
 *     WHERE
 *         name = 'sent') AS subquery
 * WHERE
 *     volunteer_references.id = :referenceId!
 * RETURNING
 *     volunteer_references.id AS ok
 * ```
 */
exports.updateVolunteerReferenceSentById = new query_1.PreparedQuery(updateVolunteerReferenceSentByIdIR);
const updateVolunteerReferenceStatusByIdIR = { "name": "updateVolunteerReferenceStatusById", "params": [{ "name": "status", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 11048, "b": 11054, "line": 403, "col": 16 }] } }, { "name": "referenceId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 11106, "b": 11117, "line": 405, "col": 31 }] } }], "usedParamSet": { "status": true, "referenceId": true }, "statement": { "body": "UPDATE\n    volunteer_references\nSET\n    status_id = subquery.id,\n    sent_at = NOW(),\n    updated_at = NOW()\nFROM (\n    SELECT\n        id\n    FROM\n        volunteer_reference_statuses\n    WHERE\n        name = :status!) AS subquery\nWHERE\n    volunteer_references.id = :referenceId!\nRETURNING\n    volunteer_references.id AS ok", "loc": { "a": 10838, "b": 11161, "line": 391, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     volunteer_references
 * SET
 *     status_id = subquery.id,
 *     sent_at = NOW(),
 *     updated_at = NOW()
 * FROM (
 *     SELECT
 *         id
 *     FROM
 *         volunteer_reference_statuses
 *     WHERE
 *         name = :status!) AS subquery
 * WHERE
 *     volunteer_references.id = :referenceId!
 * RETURNING
 *     volunteer_references.id AS ok
 * ```
 */
exports.updateVolunteerReferenceStatusById = new query_1.PreparedQuery(updateVolunteerReferenceStatusByIdIR);
const deleteVolunteerReferenceByIdIR = { "name": "deleteVolunteerReferenceById", "params": [{ "name": "referenceEmail", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 11458, "b": 11472, "line": 424, "col": 34 }] } }, { "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 11514, "b": 11520, "line": 425, "col": 40 }] } }], "usedParamSet": { "referenceEmail": true, "userId": true }, "statement": { "body": "UPDATE\n    volunteer_references\nSET\n    status_id = subquery.id,\n    updated_at = NOW()\nFROM (\n    SELECT\n        id\n    FROM\n        volunteer_reference_statuses\n    WHERE\n        name = 'removed') AS subquery\nWHERE\n    volunteer_references.email = :referenceEmail!\n    AND volunteer_references.user_id = :userId!\nRETURNING\n    volunteer_references.id AS ok", "loc": { "a": 11207, "b": 11564, "line": 411, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     volunteer_references
 * SET
 *     status_id = subquery.id,
 *     updated_at = NOW()
 * FROM (
 *     SELECT
 *         id
 *     FROM
 *         volunteer_reference_statuses
 *     WHERE
 *         name = 'removed') AS subquery
 * WHERE
 *     volunteer_references.email = :referenceEmail!
 *     AND volunteer_references.user_id = :userId!
 * RETURNING
 *     volunteer_references.id AS ok
 * ```
 */
exports.deleteVolunteerReferenceById = new query_1.PreparedQuery(deleteVolunteerReferenceByIdIR);
const updateVolunteersReadyToCoachByIdsIR = { "name": "updateVolunteersReadyToCoachByIds", "params": [{ "name": "userIds", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 11736, "b": 11743, "line": 437, "col": 20 }] } }], "usedParamSet": { "userIds": true }, "statement": { "body": "UPDATE\n    user_product_flags\nSET\n    sent_ready_to_coach_email = TRUE,\n    updated_at = NOW()\nWHERE\n    user_id = ANY (:userIds!)\nRETURNING\n    user_id AS ok", "loc": { "a": 11615, "b": 11772, "line": 431, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     user_product_flags
 * SET
 *     sent_ready_to_coach_email = TRUE,
 *     updated_at = NOW()
 * WHERE
 *     user_id = ANY (:userIds!)
 * RETURNING
 *     user_id AS ok
 * ```
 */
exports.updateVolunteersReadyToCoachByIds = new query_1.PreparedQuery(updateVolunteersReadyToCoachByIdsIR);
const updateVolunteerElapsedAvailabilityByIdIR = { "name": "updateVolunteerElapsedAvailabilityById", "params": [{ "name": "elapsedAvailability", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 11968, "b": 11987, "line": 449, "col": 46 }] } }, { "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 12069, "b": 12075, "line": 453, "col": 19 }, { "a": 12111, "b": 12117, "line": 455, "col": 15 }] } }], "usedParamSet": { "elapsedAvailability": true, "userId": true }, "statement": { "body": "UPDATE\n    volunteer_profiles\nSET\n    elapsed_availability = subquery.total\nFROM (\n    SELECT\n        COALESCE(elapsed_availability, 0) + (:elapsedAvailability!)::int AS total\n    FROM\n        volunteer_profiles\n    WHERE\n        user_id = :userId!) AS subquery\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok", "loc": { "a": 11828, "b": 12145, "line": 443, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     volunteer_profiles
 * SET
 *     elapsed_availability = subquery.total
 * FROM (
 *     SELECT
 *         COALESCE(elapsed_availability, 0) + (:elapsedAvailability!)::int AS total
 *     FROM
 *         volunteer_profiles
 *     WHERE
 *         user_id = :userId!) AS subquery
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
exports.updateVolunteerElapsedAvailabilityById = new query_1.PreparedQuery(updateVolunteerElapsedAvailabilityByIdIR);
const updateVolunteerTotalHoursByIdIR = { "name": "updateVolunteerTotalHoursById", "params": [{ "name": "totalHours", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 12334, "b": 12344, "line": 467, "col": 47 }] } }, { "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 12430, "b": 12436, "line": 471, "col": 19 }, { "a": 12472, "b": 12478, "line": 473, "col": 15 }] } }], "usedParamSet": { "totalHours": true, "userId": true }, "statement": { "body": "UPDATE\n    volunteer_profiles\nSET\n    total_volunteer_hours = subquery.total\nFROM (\n    SELECT\n        COALESCE(total_volunteer_hours, 0) + (:totalHours!)::numeric AS total\n    FROM\n        volunteer_profiles\n    WHERE\n        user_id = :userId!) AS subquery\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok", "loc": { "a": 12192, "b": 12506, "line": 461, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     volunteer_profiles
 * SET
 *     total_volunteer_hours = subquery.total
 * FROM (
 *     SELECT
 *         COALESCE(total_volunteer_hours, 0) + (:totalHours!)::numeric AS total
 *     FROM
 *         volunteer_profiles
 *     WHERE
 *         user_id = :userId!) AS subquery
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
exports.updateVolunteerTotalHoursById = new query_1.PreparedQuery(updateVolunteerTotalHoursByIdIR);
const getVolunteerTrainingCoursesIR = { "name": "getVolunteerTrainingCourses", "params": [{ "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 12921, "b": 12927, "line": 491, "col": 38 }] } }], "usedParamSet": { "userId": true }, "statement": { "body": "SELECT\n    user_id,\n    complete,\n    training_courses.name AS training_course,\n    progress,\n    completed_materials,\n    users_training_courses.created_at,\n    users_training_courses.updated_at\nFROM\n    users_training_courses\n    LEFT JOIN training_courses ON training_courses.id = users_training_courses.training_course_id\nWHERE\n    users_training_courses.user_id = :userId!", "loc": { "a": 12551, "b": 12927, "line": 479, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     user_id,
 *     complete,
 *     training_courses.name AS training_course,
 *     progress,
 *     completed_materials,
 *     users_training_courses.created_at,
 *     users_training_courses.updated_at
 * FROM
 *     users_training_courses
 *     LEFT JOIN training_courses ON training_courses.id = users_training_courses.training_course_id
 * WHERE
 *     users_training_courses.user_id = :userId!
 * ```
 */
exports.getVolunteerTrainingCourses = new query_1.PreparedQuery(getVolunteerTrainingCoursesIR);
const updateVolunteerTrainingByIdIR = { "name": "updateVolunteerTrainingById", "params": [{ "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 13121, "b": 13127, "line": 497, "col": 5 }] } }, { "name": "complete", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 13160, "b": 13168, "line": 499, "col": 5 }, { "a": 13403, "b": 13411, "line": 511, "col": 20 }] } }, { "name": "progress", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 13176, "b": 13184, "line": 500, "col": 5 }, { "a": 13434, "b": 13442, "line": 512, "col": 20 }] } }, { "name": "materialKey", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 13199, "b": 13210, "line": 501, "col": 12 }, { "a": 13514, "b": 13525, "line": 513, "col": 69 }, { "a": 13579, "b": 13590, "line": 516, "col": 13 }] } }, { "name": "trainingCourse", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 13303, "b": 13317, "line": 507, "col": 29 }] } }], "usedParamSet": { "userId": true, "complete": true, "progress": true, "materialKey": true, "trainingCourse": true }, "statement": { "body": "INSERT INTO users_training_courses AS ins (user_id, training_course_id, complete, progress, completed_materials, created_at, updated_at)\nSELECT\n    :userId!,\n    training_courses.id,\n    :complete!,\n    :progress!,\n    ARRAY[(:materialKey!)::text],\n    NOW(),\n    NOW()\nFROM\n    training_courses\nWHERE\n    training_courses.name = :trainingCourse!\nON CONFLICT (user_id,\n    training_course_id)\n    DO UPDATE SET\n        complete = :complete!,\n        progress = :progress!,\n        completed_materials = ARRAY_APPEND(ins.completed_materials, :materialKey!),\n        updated_at = NOW()\n    WHERE\n        NOT :materialKey! = ANY (ins.completed_materials)\n    RETURNING\n        user_id AS ok", "loc": { "a": 12972, "b": 13658, "line": 495, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_training_courses AS ins (user_id, training_course_id, complete, progress, completed_materials, created_at, updated_at)
 * SELECT
 *     :userId!,
 *     training_courses.id,
 *     :complete!,
 *     :progress!,
 *     ARRAY[(:materialKey!)::text],
 *     NOW(),
 *     NOW()
 * FROM
 *     training_courses
 * WHERE
 *     training_courses.name = :trainingCourse!
 * ON CONFLICT (user_id,
 *     training_course_id)
 *     DO UPDATE SET
 *         complete = :complete!,
 *         progress = :progress!,
 *         completed_materials = ARRAY_APPEND(ins.completed_materials, :materialKey!),
 *         updated_at = NOW()
 *     WHERE
 *         NOT :materialKey! = ANY (ins.completed_materials)
 *     RETURNING
 *         user_id AS ok
 * ```
 */
exports.updateVolunteerTrainingById = new query_1.PreparedQuery(updateVolunteerTrainingByIdIR);
const updateVolunteerPhotoIdByIdIR = { "name": "updateVolunteerPhotoIdById", "params": [{ "name": "key", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 13759, "b": 13762, "line": 525, "col": 23 }] } }, { "name": "status", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 13889, "b": 13895, "line": 533, "col": 16 }] } }, { "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 13931, "b": 13937, "line": 535, "col": 15 }] } }], "usedParamSet": { "key": true, "status": true, "userId": true }, "statement": { "body": "UPDATE\n    volunteer_profiles\nSET\n    photo_id_s3_key = :key!,\n    photo_id_status = subquery.id\nFROM (\n    SELECT\n        id\n    FROM\n        photo_id_statuses\n    WHERE\n        name = :status!) AS subquery\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok", "loc": { "a": 13702, "b": 13965, "line": 522, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     volunteer_profiles
 * SET
 *     photo_id_s3_key = :key!,
 *     photo_id_status = subquery.id
 * FROM (
 *     SELECT
 *         id
 *     FROM
 *         photo_id_statuses
 *     WHERE
 *         name = :status!) AS subquery
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
exports.updateVolunteerPhotoIdById = new query_1.PreparedQuery(updateVolunteerPhotoIdByIdIR);
const updateVolunteerSentInactive30DayEmailIR = { "name": "updateVolunteerSentInactive30DayEmail", "params": [{ "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 14141, "b": 14147, "line": 547, "col": 15 }] } }], "usedParamSet": { "userId": true }, "statement": { "body": "UPDATE\n    user_product_flags\nSET\n    sent_inactive_thirty_day_email = TRUE,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok", "loc": { "a": 14020, "b": 14175, "line": 541, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     user_product_flags
 * SET
 *     sent_inactive_thirty_day_email = TRUE,
 *     updated_at = NOW()
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
exports.updateVolunteerSentInactive30DayEmail = new query_1.PreparedQuery(updateVolunteerSentInactive30DayEmailIR);
const updateVolunteerSentInactive60DayEmailIR = { "name": "updateVolunteerSentInactive60DayEmail", "params": [{ "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 14393, "b": 14399, "line": 560, "col": 15 }] } }], "usedParamSet": { "userId": true }, "statement": { "body": "UPDATE\n    user_product_flags\nSET\n    sent_inactive_thirty_day_email = TRUE,\n    sent_inactive_sixty_day_email = TRUE,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok", "loc": { "a": 14230, "b": 14427, "line": 553, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     user_product_flags
 * SET
 *     sent_inactive_thirty_day_email = TRUE,
 *     sent_inactive_sixty_day_email = TRUE,
 *     updated_at = NOW()
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
exports.updateVolunteerSentInactive60DayEmail = new query_1.PreparedQuery(updateVolunteerSentInactive60DayEmailIR);
const updateVolunteerSentInactive90DayEmailIR = { "name": "updateVolunteerSentInactive90DayEmail", "params": [{ "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 14603, "b": 14609, "line": 572, "col": 15 }] } }], "usedParamSet": { "userId": true }, "statement": { "body": "UPDATE\n    user_product_flags\nSET\n    sent_inactive_ninety_day_email = TRUE,\n    updated_at = NOW()\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok", "loc": { "a": 14482, "b": 14637, "line": 566, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     user_product_flags
 * SET
 *     sent_inactive_ninety_day_email = TRUE,
 *     updated_at = NOW()
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
exports.updateVolunteerSentInactive90DayEmail = new query_1.PreparedQuery(updateVolunteerSentInactive90DayEmailIR);
const getVolunteerUnsentReferencesIR = { "name": "getVolunteerUnsentReferences", "params": [], "usedParamSet": {}, "statement": { "body": "SELECT\n    volunteer_references.id,\n    user_id,\n    first_name,\n    last_name,\n    email,\n    volunteer_reference_statuses.name AS status\nFROM\n    volunteer_references\n    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\nWHERE\n    volunteer_reference_statuses.name = 'unsent'", "loc": { "a": 14683, "b": 15016, "line": 578, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     volunteer_references.id,
 *     user_id,
 *     first_name,
 *     last_name,
 *     email,
 *     volunteer_reference_statuses.name AS status
 * FROM
 *     volunteer_references
 *     LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id
 * WHERE
 *     volunteer_reference_statuses.name = 'unsent'
 * ```
 */
exports.getVolunteerUnsentReferences = new query_1.PreparedQuery(getVolunteerUnsentReferencesIR);
const getReferencesForReferenceFormApologyIR = { "name": "getReferencesForReferenceFormApology", "params": [], "usedParamSet": {}, "statement": { "body": "SELECT\n    volunteer_references.id,\n    user_id,\n    first_name,\n    last_name,\n    email,\n    volunteer_reference_statuses.name AS status\nFROM\n    volunteer_references\n    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\nWHERE\n    volunteer_reference_statuses.name = 'sent'\n    AND volunteer_references.sent_at <= '2022-04-12 18:00:00.000'\n    AND volunteer_references.sent_at >= '2022-02-26 00:00:00.000'", "loc": { "a": 15070, "b": 15533, "line": 593, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     volunteer_references.id,
 *     user_id,
 *     first_name,
 *     last_name,
 *     email,
 *     volunteer_reference_statuses.name AS status
 * FROM
 *     volunteer_references
 *     LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id
 * WHERE
 *     volunteer_reference_statuses.name = 'sent'
 *     AND volunteer_references.sent_at <= '2022-04-12 18:00:00.000'
 *     AND volunteer_references.sent_at >= '2022-02-26 00:00:00.000'
 * ```
 */
exports.getReferencesForReferenceFormApology = new query_1.PreparedQuery(getReferencesForReferenceFormApologyIR);
const getReferencesByVolunteerIR = { "name": "getReferencesByVolunteer", "params": [{ "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 15884, "b": 15890, "line": 620, "col": 36 }] } }], "usedParamSet": { "userId": true }, "statement": { "body": "SELECT\n    volunteer_references.id,\n    first_name,\n    last_name,\n    email,\n    volunteer_reference_statuses.name AS status\nFROM\n    volunteer_references\n    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\nWHERE\n    volunteer_references.user_id = :userId!\n    AND volunteer_reference_statuses.name != 'removed'", "loc": { "a": 15575, "b": 15945, "line": 610, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     volunteer_references.id,
 *     first_name,
 *     last_name,
 *     email,
 *     volunteer_reference_statuses.name AS status
 * FROM
 *     volunteer_references
 *     LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id
 * WHERE
 *     volunteer_references.user_id = :userId!
 *     AND volunteer_reference_statuses.name != 'removed'
 * ```
 */
exports.getReferencesByVolunteer = new query_1.PreparedQuery(getReferencesByVolunteerIR);
const checkReferenceExistsBeforeAddingIR = { "name": "checkReferenceExistsBeforeAdding", "params": [{ "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 16439, "b": 16445, "line": 641, "col": 36 }, { "a": 16557, "b": 16563, "line": 644, "col": 36 }] } }, { "name": "email", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 16495, "b": 16500, "line": 642, "col": 48 }, { "a": 16603, "b": 16608, "line": 645, "col": 38 }] } }], "usedParamSet": { "userId": true, "email": true }, "statement": { "body": "SELECT\n    volunteer_references.id,\n    first_name,\n    last_name,\n    email,\n    volunteer_reference_statuses.name AS status,\n    sub.actions\nFROM\n    volunteer_references\n    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\n    LEFT JOIN (\n        SELECT\n            array_agg(action) AS actions\n        FROM\n            user_actions\n        WHERE\n            user_actions.user_id = :userId!\n            AND user_actions.reference_email = :email!) sub ON TRUE\nWHERE\n    volunteer_references.user_id = :userId!\n    AND volunteer_references.email = :email!", "loc": { "a": 15995, "b": 16608, "line": 625, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     volunteer_references.id,
 *     first_name,
 *     last_name,
 *     email,
 *     volunteer_reference_statuses.name AS status,
 *     sub.actions
 * FROM
 *     volunteer_references
 *     LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id
 *     LEFT JOIN (
 *         SELECT
 *             array_agg(action) AS actions
 *         FROM
 *             user_actions
 *         WHERE
 *             user_actions.user_id = :userId!
 *             AND user_actions.reference_email = :email!) sub ON TRUE
 * WHERE
 *     volunteer_references.user_id = :userId!
 *     AND volunteer_references.email = :email!
 * ```
 */
exports.checkReferenceExistsBeforeAdding = new query_1.PreparedQuery(checkReferenceExistsBeforeAddingIR);
const getReferencesByVolunteerForAdminDetailIR = { "name": "getReferencesByVolunteerForAdminDetail", "params": [{ "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 17189, "b": 17195, "line": 668, "col": 36 }] } }], "usedParamSet": { "userId": true }, "statement": { "body": "SELECT\n    volunteer_references.id,\n    first_name,\n    last_name,\n    email,\n    volunteer_reference_statuses.name AS status,\n    affiliation,\n    relationship_length,\n    patient,\n    positive_role_model,\n    agreeable_and_approachable,\n    communicates_effectively,\n    rejection_reason,\n    additional_info,\n    trustworthy_with_children\nFROM\n    volunteer_references\n    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\nWHERE\n    volunteer_references.user_id = :userId!\n    AND volunteer_reference_statuses.name != 'removed'", "loc": { "a": 16664, "b": 17250, "line": 649, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     volunteer_references.id,
 *     first_name,
 *     last_name,
 *     email,
 *     volunteer_reference_statuses.name AS status,
 *     affiliation,
 *     relationship_length,
 *     patient,
 *     positive_role_model,
 *     agreeable_and_approachable,
 *     communicates_effectively,
 *     rejection_reason,
 *     additional_info,
 *     trustworthy_with_children
 * FROM
 *     volunteer_references
 *     LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id
 * WHERE
 *     volunteer_references.user_id = :userId!
 *     AND volunteer_reference_statuses.name != 'removed'
 * ```
 */
exports.getReferencesByVolunteerForAdminDetail = new query_1.PreparedQuery(getReferencesByVolunteerForAdminDetailIR);
const getVolunteerForPendingStatusIR = { "name": "getVolunteerForPendingStatus", "params": [{ "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 18054, "b": 18060, "line": 696, "col": 23 }, { "a": 18108, "b": 18114, "line": 698, "col": 16 }] } }], "usedParamSet": { "userId": true }, "statement": { "body": "SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_profiles.approved,\n    volunteer_profiles.onboarded,\n    volunteer_profiles.country,\n    photo_id_statuses.name AS photo_id_status,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    occupations.occupations\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN photo_id_statuses ON photo_id_statuses.id = volunteer_profiles.photo_id_status\n    LEFT JOIN (\n        SELECT\n            array_agg(occupation) AS occupations\n        FROM\n            volunteer_occupations\n        WHERE\n            user_id = :userId!) AS occupations ON TRUE\nWHERE\n    users.id = :userId!", "loc": { "a": 17296, "b": 18114, "line": 673, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     last_name,
 *     phone,
 *     email,
 *     volunteer_profiles.approved,
 *     volunteer_profiles.onboarded,
 *     volunteer_profiles.country,
 *     photo_id_statuses.name AS photo_id_status,
 *     volunteer_partner_orgs.key AS volunteer_partner_org,
 *     occupations.occupations
 * FROM
 *     users
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 *     LEFT JOIN photo_id_statuses ON photo_id_statuses.id = volunteer_profiles.photo_id_status
 *     LEFT JOIN (
 *         SELECT
 *             array_agg(occupation) AS occupations
 *         FROM
 *             volunteer_occupations
 *         WHERE
 *             user_id = :userId!) AS occupations ON TRUE
 * WHERE
 *     users.id = :userId!
 * ```
 */
exports.getVolunteerForPendingStatus = new query_1.PreparedQuery(getVolunteerForPendingStatusIR);
const updateVolunteerReferenceStatusIR = { "name": "updateVolunteerReferenceStatus", "params": [{ "name": "status", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 18351, "b": 18357, "line": 713, "col": 16 }] } }, { "name": "referenceId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 18409, "b": 18420, "line": 715, "col": 31 }] } }], "usedParamSet": { "status": true, "referenceId": true }, "statement": { "body": "UPDATE\n    volunteer_references\nSET\n    status_id = subquery.id,\n    updated_at = NOW()\nFROM (\n    SELECT\n        id\n    FROM\n        volunteer_reference_statuses\n    WHERE\n        name = :status!) AS subquery\nWHERE\n    volunteer_references.id = :referenceId!\nRETURNING\n    volunteer_references.id AS ok", "loc": { "a": 18162, "b": 18464, "line": 702, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     volunteer_references
 * SET
 *     status_id = subquery.id,
 *     updated_at = NOW()
 * FROM (
 *     SELECT
 *         id
 *     FROM
 *         volunteer_reference_statuses
 *     WHERE
 *         name = :status!) AS subquery
 * WHERE
 *     volunteer_references.id = :referenceId!
 * RETURNING
 *     volunteer_references.id AS ok
 * ```
 */
exports.updateVolunteerReferenceStatus = new query_1.PreparedQuery(updateVolunteerReferenceStatusIR);
const updateVolunteerApprovedIR = { "name": "updateVolunteerApproved", "params": [{ "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 18623, "b": 18629, "line": 727, "col": 34 }] } }], "usedParamSet": { "userId": true }, "statement": { "body": "UPDATE\n    volunteer_profiles\nSET\n    approved = TRUE,\n    updated_at = NOW()\nWHERE\n    volunteer_profiles.user_id = :userId!\nRETURNING\n    volunteer_profiles.user_id AS ok", "loc": { "a": 18505, "b": 18676, "line": 721, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     volunteer_profiles
 * SET
 *     approved = TRUE,
 *     updated_at = NOW()
 * WHERE
 *     volunteer_profiles.user_id = :userId!
 * RETURNING
 *     volunteer_profiles.user_id AS ok
 * ```
 */
exports.updateVolunteerApproved = new query_1.PreparedQuery(updateVolunteerApprovedIR);
const updateVolunteerPendingIR = { "name": "updateVolunteerPending", "params": [{ "name": "approved", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 18766, "b": 18774, "line": 736, "col": 16 }] } }, { "name": "status", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 18925, "b": 18931, "line": 745, "col": 16 }] } }, { "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 18986, "b": 18992, "line": 747, "col": 34 }] } }], "usedParamSet": { "approved": true, "status": true, "userId": true }, "statement": { "body": "UPDATE\n    volunteer_profiles\nSET\n    approved = :approved!,\n    photo_id_status = subquery.id,\n    updated_at = NOW()\nFROM (\n    SELECT\n        id\n    FROM\n        photo_id_statuses\n    WHERE\n        name = :status!) AS subquery\nWHERE\n    volunteer_profiles.user_id = :userId!\nRETURNING\n    volunteer_profiles.user_id AS ok", "loc": { "a": 18716, "b": 19039, "line": 733, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     volunteer_profiles
 * SET
 *     approved = :approved!,
 *     photo_id_status = subquery.id,
 *     updated_at = NOW()
 * FROM (
 *     SELECT
 *         id
 *     FROM
 *         photo_id_statuses
 *     WHERE
 *         name = :status!) AS subquery
 * WHERE
 *     volunteer_profiles.user_id = :userId!
 * RETURNING
 *     volunteer_profiles.user_id AS ok
 * ```
 */
exports.updateVolunteerPending = new query_1.PreparedQuery(updateVolunteerPendingIR);
const updateVolunteerOnboardedIR = { "name": "updateVolunteerOnboarded", "params": [{ "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 19200, "b": 19206, "line": 759, "col": 34 }] } }], "usedParamSet": { "userId": true }, "statement": { "body": "UPDATE\n    volunteer_profiles\nSET\n    onboarded = TRUE,\n    updated_at = NOW()\nWHERE\n    volunteer_profiles.user_id = :userId!\nRETURNING\n    volunteer_profiles.user_id AS ok", "loc": { "a": 19081, "b": 19253, "line": 753, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     volunteer_profiles
 * SET
 *     onboarded = TRUE,
 *     updated_at = NOW()
 * WHERE
 *     volunteer_profiles.user_id = :userId!
 * RETURNING
 *     volunteer_profiles.user_id AS ok
 * ```
 */
exports.updateVolunteerOnboarded = new query_1.PreparedQuery(updateVolunteerOnboardedIR);
const getVolunteersForNiceToMeetYouIR = { "name": "getVolunteersForNiceToMeetYou", "params": [{ "name": "start", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 19755, "b": 19760, "line": 780, "col": 29 }] } }, { "name": "end", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 19790, "b": 19793, "line": 781, "col": 28 }] } }], "usedParamSet": { "start": true, "end": true }, "statement": { "body": "SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\nWHERE\n    users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND users.created_at >= :start!\n    AND users.created_at < :end!", "loc": { "a": 19300, "b": 19793, "line": 765, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     last_name,
 *     phone,
 *     email,
 *     volunteer_partner_orgs.key AS volunteer_partner_org
 * FROM
 *     users
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 * WHERE
 *     users.banned IS FALSE
 *     AND users.deactivated IS FALSE
 *     AND users.test_user IS FALSE
 *     AND users.created_at >= :start!
 *     AND users.created_at < :end!
 * ```
 */
exports.getVolunteersForNiceToMeetYou = new query_1.PreparedQuery(getVolunteersForNiceToMeetYouIR);
const getVolunteersForReadyToCoachIR = { "name": "getVolunteersForReadyToCoach", "params": [], "usedParamSet": {}, "statement": { "body": "SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN user_product_flags ON user_product_flags.user_id = users.id\nWHERE\n    users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND volunteer_profiles.onboarded IS TRUE\n    AND volunteer_profiles.approved IS TRUE\n    AND user_product_flags.sent_ready_to_coach_email IS FALSE", "loc": { "a": 19839, "b": 20488, "line": 785, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     last_name,
 *     phone,
 *     email,
 *     volunteer_partner_orgs.key AS volunteer_partner_org
 * FROM
 *     users
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 *     LEFT JOIN user_product_flags ON user_product_flags.user_id = users.id
 * WHERE
 *     users.banned IS FALSE
 *     AND users.deactivated IS FALSE
 *     AND users.test_user IS FALSE
 *     AND volunteer_profiles.onboarded IS TRUE
 *     AND volunteer_profiles.approved IS TRUE
 *     AND user_product_flags.sent_ready_to_coach_email IS FALSE
 * ```
 */
exports.getVolunteersForReadyToCoach = new query_1.PreparedQuery(getVolunteersForReadyToCoachIR);
const getVolunteersForWaitingReferencesIR = { "name": "getVolunteersForWaitingReferences", "params": [{ "name": "start", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 21269, "b": 21274, "line": 825, "col": 40 }] } }, { "name": "end", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 21316, "b": 21319, "line": 826, "col": 40 }] } }], "usedParamSet": { "start": true, "end": true }, "statement": { "body": "SELECT\n    users.id,\n    users.first_name,\n    users.last_name,\n    users.phone,\n    users.email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN volunteer_references ON volunteer_references.user_id = users.id\n    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\nWHERE\n    users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND volunteer_reference_statuses.name = 'sent'\n    AND volunteer_references.sent_at > :start!\n    AND volunteer_references.sent_at < :end!\nGROUP BY\n    users.id,\n    volunteer_partner_orgs.key", "loc": { "a": 20539, "b": 21373, "line": 807, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     users.first_name,
 *     users.last_name,
 *     users.phone,
 *     users.email,
 *     volunteer_partner_orgs.key AS volunteer_partner_org
 * FROM
 *     users
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 *     LEFT JOIN volunteer_references ON volunteer_references.user_id = users.id
 *     LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id
 * WHERE
 *     users.banned IS FALSE
 *     AND users.deactivated IS FALSE
 *     AND users.test_user IS FALSE
 *     AND volunteer_reference_statuses.name = 'sent'
 *     AND volunteer_references.sent_at > :start!
 *     AND volunteer_references.sent_at < :end!
 * GROUP BY
 *     users.id,
 *     volunteer_partner_orgs.key
 * ```
 */
exports.getVolunteersForWaitingReferences = new query_1.PreparedQuery(getVolunteersForWaitingReferencesIR);
const addVolunteerCertificationIR = { "name": "addVolunteerCertification", "params": [{ "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 21513, "b": 21519, "line": 835, "col": 5 }] } }, { "name": "subject", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 21729, "b": 21736, "line": 846, "col": 24 }] } }], "usedParamSet": { "userId": true, "subject": true }, "statement": { "body": "INSERT INTO users_certifications (user_id, certification_id, created_at, updated_at)\nSELECT\n    :userId!,\n    subquery.id,\n    NOW(),\n    NOW()\nFROM (\n    SELECT\n        certifications.id\n    FROM\n        certifications\n        JOIN quizzes ON quizzes.name = certifications.name\n    WHERE\n        quizzes.name = :subject!) AS subquery\nON CONFLICT (user_id,\n    certification_id)\n    DO NOTHING\nRETURNING\n    user_id AS ok", "loc": { "a": 21416, "b": 21836, "line": 833, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_certifications (user_id, certification_id, created_at, updated_at)
 * SELECT
 *     :userId!,
 *     subquery.id,
 *     NOW(),
 *     NOW()
 * FROM (
 *     SELECT
 *         certifications.id
 *     FROM
 *         certifications
 *         JOIN quizzes ON quizzes.name = certifications.name
 *     WHERE
 *         quizzes.name = :subject!) AS subquery
 * ON CONFLICT (user_id,
 *     certification_id)
 *     DO NOTHING
 * RETURNING
 *     user_id AS ok
 * ```
 */
exports.addVolunteerCertification = new query_1.PreparedQuery(addVolunteerCertificationIR);
const updateVolunteerQuizIR = { "name": "updateVolunteerQuiz", "params": [{ "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 21979, "b": 21985, "line": 857, "col": 5 }] } }, { "name": "passed", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 22017, "b": 22023, "line": 860, "col": 5 }, { "a": 22270, "b": 22276, "line": 874, "col": 18 }] } }, { "name": "quiz", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 22143, "b": 22147, "line": 869, "col": 24 }] } }], "usedParamSet": { "userId": true, "passed": true, "quiz": true }, "statement": { "body": "INSERT INTO users_quizzes AS ins (user_id, quiz_id, attempts, passed, created_at, updated_at)\nSELECT\n    :userId!,\n    subquery.id,\n    1,\n    :passed!,\n    NOW(),\n    NOW()\nFROM (\n    SELECT\n        quizzes.id\n    FROM\n        quizzes\n    WHERE\n        quizzes.name = :quiz!) AS subquery\nON CONFLICT (user_id,\n    quiz_id)\n    DO UPDATE SET\n        attempts = ins.attempts + 1,\n        passed = :passed!,\n        updated_at = NOW()\n    RETURNING\n        user_id AS ok", "loc": { "a": 21873, "b": 22340, "line": 855, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_quizzes AS ins (user_id, quiz_id, attempts, passed, created_at, updated_at)
 * SELECT
 *     :userId!,
 *     subquery.id,
 *     1,
 *     :passed!,
 *     NOW(),
 *     NOW()
 * FROM (
 *     SELECT
 *         quizzes.id
 *     FROM
 *         quizzes
 *     WHERE
 *         quizzes.name = :quiz!) AS subquery
 * ON CONFLICT (user_id,
 *     quiz_id)
 *     DO UPDATE SET
 *         attempts = ins.attempts + 1,
 *         passed = :passed!,
 *         updated_at = NOW()
 *     RETURNING
 *         user_id AS ok
 * ```
 */
exports.updateVolunteerQuiz = new query_1.PreparedQuery(updateVolunteerQuizIR);
const getVolunteerForTextResponseIR = { "name": "getVolunteerForTextResponse", "params": [{ "name": "phone", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 22917, "b": 22922, "line": 896, "col": 19 }] } }], "usedParamSet": { "phone": true }, "statement": { "body": "SELECT\n    users.id AS volunteer_id,\n    sessions.id AS session_id,\n    sessions.volunteer_joined_at,\n    sessions.ended_at,\n    subjects.name AS subject,\n    topics.name AS topic\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN notifications ON notifications.user_id = users.id\n    LEFT JOIN sessions ON sessions.id = notifications.session_id\n    LEFT JOIN subjects ON subjects.id = sessions.subject_id\n    LEFT JOIN topics ON topics.id = subjects.topic_id\nWHERE\n    users.phone = :phone!\nORDER BY\n    notifications.created_at DESC\nLIMIT 1", "loc": { "a": 22385, "b": 22973, "line": 881, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id AS volunteer_id,
 *     sessions.id AS session_id,
 *     sessions.volunteer_joined_at,
 *     sessions.ended_at,
 *     subjects.name AS subject,
 *     topics.name AS topic
 * FROM
 *     users
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN notifications ON notifications.user_id = users.id
 *     LEFT JOIN sessions ON sessions.id = notifications.session_id
 *     LEFT JOIN subjects ON subjects.id = sessions.subject_id
 *     LEFT JOIN topics ON topics.id = subjects.topic_id
 * WHERE
 *     users.phone = :phone!
 * ORDER BY
 *     notifications.created_at DESC
 * LIMIT 1
 * ```
 */
exports.getVolunteerForTextResponse = new query_1.PreparedQuery(getVolunteerForTextResponseIR);
const getVolunteersToReviewIR = { "name": "getVolunteersToReview", "params": [{ "name": "limit", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 24280, "b": 24285, "line": 936, "col": 8 }] } }, { "name": "offset", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 24302, "b": 24308, "line": 936, "col": 30 }] } }], "usedParamSet": { "limit": true, "offset": true }, "statement": { "body": "SELECT\n    users.id,\n    users.first_name AS first_name,\n    users.last_name AS last_name,\n    users.first_name AS firstname,\n    users.last_name AS lastname,\n    users.email,\n    users.created_at,\n    MAX(user_actions.created_at) AS ready_for_review_at\nFROM\n    users\n    JOIN volunteer_profiles ON users.id = volunteer_profiles.user_id\n    JOIN photo_id_statuses ON photo_id_statuses.id = volunteer_profiles.photo_id_status\n    JOIN volunteer_occupations ON volunteer_occupations.user_id = users.id -- user is only ready for review if they submitted background info\n    JOIN user_actions ON user_actions.user_id = users.id\nWHERE\n    volunteer_profiles.approved IS FALSE\n    AND NOT volunteer_profiles.country IS NULL\n    AND NOT volunteer_profiles.photo_id_s3_key IS NULL\n    AND photo_id_statuses.name = ANY ('{ \"submitted\", \"approved\" }')\n    AND user_actions.action = ANY ('{ \"ADDED PHOTO ID\", \"COMPLETED BACKGROUND INFO\" }')\n    AND (\n        SELECT\n            MAX(user_actions.created_at)\n        FROM\n            user_actions\n        WHERE\n            action = ANY ('{ \"ADDED PHOTO ID\", \"COMPLETED BACKGROUND INFO\" }')\n            AND user_id = users.id) > CURRENT_DATE - INTERVAL '3 MONTHS'\nGROUP BY\n    users.id\nORDER BY\n    ready_for_review_at ASC\nLIMIT (:limit!)::int OFFSET (:offset!)::int", "loc": { "a": 23012, "b": 24314, "line": 903, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     users.first_name AS first_name,
 *     users.last_name AS last_name,
 *     users.first_name AS firstname,
 *     users.last_name AS lastname,
 *     users.email,
 *     users.created_at,
 *     MAX(user_actions.created_at) AS ready_for_review_at
 * FROM
 *     users
 *     JOIN volunteer_profiles ON users.id = volunteer_profiles.user_id
 *     JOIN photo_id_statuses ON photo_id_statuses.id = volunteer_profiles.photo_id_status
 *     JOIN volunteer_occupations ON volunteer_occupations.user_id = users.id -- user is only ready for review if they submitted background info
 *     JOIN user_actions ON user_actions.user_id = users.id
 * WHERE
 *     volunteer_profiles.approved IS FALSE
 *     AND NOT volunteer_profiles.country IS NULL
 *     AND NOT volunteer_profiles.photo_id_s3_key IS NULL
 *     AND photo_id_statuses.name = ANY ('{ "submitted", "approved" }')
 *     AND user_actions.action = ANY ('{ "ADDED PHOTO ID", "COMPLETED BACKGROUND INFO" }')
 *     AND (
 *         SELECT
 *             MAX(user_actions.created_at)
 *         FROM
 *             user_actions
 *         WHERE
 *             action = ANY ('{ "ADDED PHOTO ID", "COMPLETED BACKGROUND INFO" }')
 *             AND user_id = users.id) > CURRENT_DATE - INTERVAL '3 MONTHS'
 * GROUP BY
 *     users.id
 * ORDER BY
 *     ready_for_review_at ASC
 * LIMIT (:limit!)::int OFFSET (:offset!)::int
 * ```
 */
exports.getVolunteersToReview = new query_1.PreparedQuery(getVolunteersToReviewIR);
const getReferencesToFollowupIR = { "name": "getReferencesToFollowup", "params": [{ "name": "start", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 25156, "b": 25161, "line": 958, "col": 40 }] } }, { "name": "end", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 25203, "b": 25206, "line": 959, "col": 40 }] } }], "usedParamSet": { "start": true, "end": true }, "statement": { "body": "SELECT\n    users.id AS volunteer_id,\n    users.first_name AS volunteer_first_name,\n    users.last_name AS volunteer_last_name,\n    volunteer_references.id AS reference_id,\n    volunteer_references.first_name AS reference_first_name,\n    volunteer_references.last_name AS reference_last_name,\n    volunteer_references.email AS reference_email\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    JOIN volunteer_references ON volunteer_references.user_id = users.id\n    LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id\nWHERE\n    users.banned IS FALSE\n    AND users.deactivated IS FALSE\n    AND users.test_user IS FALSE\n    AND volunteer_reference_statuses.name = 'sent'\n    AND volunteer_references.sent_at > :start!\n    AND volunteer_references.sent_at < :end!", "loc": { "a": 24355, "b": 25206, "line": 940, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id AS volunteer_id,
 *     users.first_name AS volunteer_first_name,
 *     users.last_name AS volunteer_last_name,
 *     volunteer_references.id AS reference_id,
 *     volunteer_references.first_name AS reference_first_name,
 *     volunteer_references.last_name AS reference_last_name,
 *     volunteer_references.email AS reference_email
 * FROM
 *     users
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     JOIN volunteer_references ON volunteer_references.user_id = users.id
 *     LEFT JOIN volunteer_reference_statuses ON volunteer_reference_statuses.id = volunteer_references.status_id
 * WHERE
 *     users.banned IS FALSE
 *     AND users.deactivated IS FALSE
 *     AND users.test_user IS FALSE
 *     AND volunteer_reference_statuses.name = 'sent'
 *     AND volunteer_references.sent_at > :start!
 *     AND volunteer_references.sent_at < :end!
 * ```
 */
exports.getReferencesToFollowup = new query_1.PreparedQuery(getReferencesToFollowupIR);
const updateVolunteerBackgroundInfoIR = { "name": "updateVolunteerBackgroundInfo", "params": [{ "name": "occupation", "codeRefs": { "defined": { "a": 25259, "b": 25268, "line": 964, "col": 8 }, "used": [{ "a": 25536, "b": 25546, "line": 973, "col": 13 }] }, "transform": { "type": "pick_array_spread", "keys": [{ "name": "userId", "required": false }, { "name": "occupation", "required": false }, { "name": "createdAt", "required": false }, { "name": "updatedAt", "required": false }] }, "required": true }, { "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 25404, "b": 25410, "line": 968, "col": 21 }, { "a": 26194, "b": 26200, "line": 990, "col": 23 }] } }, { "name": "approved", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 25683, "b": 25690, "line": 979, "col": 33 }] } }, { "name": "experience", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 25739, "b": 25748, "line": 980, "col": 35 }] } }, { "name": "company", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 25796, "b": 25802, "line": 981, "col": 32 }] } }, { "name": "college", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 25847, "b": 25853, "line": 982, "col": 32 }] } }, { "name": "linkedInUrl", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 25903, "b": 25913, "line": 983, "col": 37 }] } }, { "name": "country", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 25963, "b": 25969, "line": 984, "col": 32 }] } }, { "name": "state", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 26012, "b": 26016, "line": 985, "col": 30 }] } }, { "name": "city", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 26056, "b": 26059, "line": 986, "col": 29 }] } }, { "name": "languages", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 26103, "b": 26111, "line": 987, "col": 34 }] } }], "usedParamSet": { "userId": true, "occupation": true, "approved": true, "experience": true, "company": true, "college": true, "linkedInUrl": true, "country": true, "state": true, "city": true, "languages": true }, "statement": { "body": "WITH clear_occ AS (\n    DELETE FROM volunteer_occupations\n    WHERE user_id = :userId!\n),\nins_occ AS (\nINSERT INTO volunteer_occupations (user_id, occupation, created_at, updated_at)\n        VALUES\n            :occupation!\n        ON CONFLICT\n            DO NOTHING)\n        UPDATE\n            volunteer_profiles\n        SET\n            approved = COALESCE(:approved, approved),\n            experience = COALESCE(:experience, experience),\n            company = COALESCE(:company, company),\n            college = COALESCE(:college, college),\n            linkedin_url = COALESCE(:linkedInUrl, linkedin_url),\n            country = COALESCE(:country, country),\n            state = COALESCE(:state, state),\n            city = COALESCE(:city, city),\n            languages = COALESCE(:languages, languages),\n            updated_at = NOW()\n        WHERE\n            user_id = :userId!\n        RETURNING\n            user_id AS ok", "loc": { "a": 25325, "b": 26244, "line": 966, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * WITH clear_occ AS (
 *     DELETE FROM volunteer_occupations
 *     WHERE user_id = :userId!
 * ),
 * ins_occ AS (
 * INSERT INTO volunteer_occupations (user_id, occupation, created_at, updated_at)
 *         VALUES
 *             :occupation!
 *         ON CONFLICT
 *             DO NOTHING)
 *         UPDATE
 *             volunteer_profiles
 *         SET
 *             approved = COALESCE(:approved, approved),
 *             experience = COALESCE(:experience, experience),
 *             company = COALESCE(:company, company),
 *             college = COALESCE(:college, college),
 *             linkedin_url = COALESCE(:linkedInUrl, linkedin_url),
 *             country = COALESCE(:country, country),
 *             state = COALESCE(:state, state),
 *             city = COALESCE(:city, city),
 *             languages = COALESCE(:languages, languages),
 *             updated_at = NOW()
 *         WHERE
 *             user_id = :userId!
 *         RETURNING
 *             user_id AS ok
 * ```
 */
exports.updateVolunteerBackgroundInfo = new query_1.PreparedQuery(updateVolunteerBackgroundInfoIR);
const getQuizzesPassedForDateRangeIR = { "name": "getQuizzesPassedForDateRange", "params": [{ "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 26368, "b": 26374, "line": 1001, "col": 15 }] } }, { "name": "start", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 26399, "b": 26404, "line": 1002, "col": 23 }] } }, { "name": "end", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 26429, "b": 26432, "line": 1003, "col": 23 }] } }], "usedParamSet": { "userId": true, "start": true, "end": true }, "statement": { "body": "SELECT\n    COUNT(*)::int AS total\nFROM\n    users_quizzes\nWHERE\n    user_id = :userId!\n    AND updated_at >= :start!\n    AND updated_at <= :end!\n    AND passed IS TRUE", "loc": { "a": 26290, "b": 26455, "line": 996, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     COUNT(*)::int AS total
 * FROM
 *     users_quizzes
 * WHERE
 *     user_id = :userId!
 *     AND updated_at >= :start!
 *     AND updated_at <= :end!
 *     AND passed IS TRUE
 * ```
 */
exports.getQuizzesPassedForDateRange = new query_1.PreparedQuery(getQuizzesPassedForDateRangeIR);
const updateVolunteerUserForAdminIR = { "name": "updateVolunteerUserForAdmin", "params": [{ "name": "firstName", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 26548, "b": 26556, "line": 1011, "col": 27 }] } }, { "name": "lastName", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 26598, "b": 26605, "line": 1012, "col": 26 }] } }, { "name": "email", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 26633, "b": 26638, "line": 1013, "col": 13 }] } }, { "name": "isVerified", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 26657, "b": 26667, "line": 1014, "col": 16 }] } }, { "name": "isBanned", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 26684, "b": 26692, "line": 1015, "col": 14 }] } }, { "name": "isDeactivated", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 26714, "b": 26727, "line": 1016, "col": 19 }] } }, { "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 26751, "b": 26757, "line": 1018, "col": 16 }] } }], "usedParamSet": { "firstName": true, "lastName": true, "email": true, "isVerified": true, "isBanned": true, "isDeactivated": true, "userId": true }, "statement": { "body": "UPDATE\n    users\nSET\n    first_name = COALESCE(:firstName, first_name),\n    last_name = COALESCE(:lastName, last_name),\n    email = :email!,\n    verified = :isVerified!,\n    banned = :isBanned!,\n    deactivated = :isDeactivated!\nWHERE\n    users.id = :userId!\nRETURNING\n    id AS ok", "loc": { "a": 26500, "b": 26780, "line": 1008, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users
 * SET
 *     first_name = COALESCE(:firstName, first_name),
 *     last_name = COALESCE(:lastName, last_name),
 *     email = :email!,
 *     verified = :isVerified!,
 *     banned = :isBanned!,
 *     deactivated = :isDeactivated!
 * WHERE
 *     users.id = :userId!
 * RETURNING
 *     id AS ok
 * ```
 */
exports.updateVolunteerUserForAdmin = new query_1.PreparedQuery(updateVolunteerUserForAdminIR);
const updateVolunteerProfilesForAdminIR = { "name": "updateVolunteerProfilesForAdmin", "params": [{ "name": "partnerOrgId", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 26895, "b": 26906, "line": 1027, "col": 32 }] } }, { "name": "approved", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 26934, "b": 26941, "line": 1028, "col": 25 }] } }, { "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 26975, "b": 26981, "line": 1030, "col": 15 }] } }], "usedParamSet": { "partnerOrgId": true, "approved": true, "userId": true }, "statement": { "body": "UPDATE\n    volunteer_profiles\nSET\n    volunteer_partner_org_id = :partnerOrgId,\n    approved = COALESCE(:approved, approved)\nWHERE\n    user_id = :userId!\nRETURNING\n    user_id AS ok", "loc": { "a": 26829, "b": 27009, "line": 1024, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     volunteer_profiles
 * SET
 *     volunteer_partner_org_id = :partnerOrgId,
 *     approved = COALESCE(:approved, approved)
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
exports.updateVolunteerProfilesForAdmin = new query_1.PreparedQuery(updateVolunteerProfilesForAdminIR);
const createVolunteerUserIR = { "name": "createVolunteerUser", "params": [{ "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 27248, "b": 27254, "line": 1037, "col": 13 }] } }, { "name": "email", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 27258, "b": 27263, "line": 1037, "col": 23 }] } }, { "name": "phone", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 27267, "b": 27272, "line": 1037, "col": 32 }] } }, { "name": "firstName", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 27276, "b": 27285, "line": 1037, "col": 41 }] } }, { "name": "lastName", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 27289, "b": 27297, "line": 1037, "col": 54 }] } }, { "name": "password", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 27301, "b": 27309, "line": 1037, "col": 66 }] } }, { "name": "referredBy", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 27320, "b": 27329, "line": 1037, "col": 85 }] } }, { "name": "referralCode", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 27333, "b": 27345, "line": 1037, "col": 98 }] } }, { "name": "signupSourceId", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 27349, "b": 27362, "line": 1037, "col": 114 }] } }, { "name": "otherSignupSource", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 27366, "b": 27382, "line": 1037, "col": 131 }] } }], "usedParamSet": { "userId": true, "email": true, "phone": true, "firstName": true, "lastName": true, "password": true, "referredBy": true, "referralCode": true, "signupSourceId": true, "otherSignupSource": true }, "statement": { "body": "INSERT INTO users (id, email, phone, first_name, last_name, PASSWORD, verified, referred_by, referral_code, signup_source_id, other_signup_source, last_activity_at, created_at, updated_at)\n    VALUES (:userId!, :email!, :phone!, :firstName!, :lastName!, :password!, FALSE, :referredBy, :referralCode!, :signupSourceId, :otherSignupSource, NOW(), NOW(), NOW())\nON CONFLICT (email)\n    DO NOTHING\nRETURNING\n    id, email, first_name, last_name, phone, banned, test_user, deactivated, created_at", "loc": { "a": 27046, "b": 27537, "line": 1036, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users (id, email, phone, first_name, last_name, PASSWORD, verified, referred_by, referral_code, signup_source_id, other_signup_source, last_activity_at, created_at, updated_at)
 *     VALUES (:userId!, :email!, :phone!, :firstName!, :lastName!, :password!, FALSE, :referredBy, :referralCode!, :signupSourceId, :otherSignupSource, NOW(), NOW(), NOW())
 * ON CONFLICT (email)
 *     DO NOTHING
 * RETURNING
 *     id, email, first_name, last_name, phone, banned, test_user, deactivated, created_at
 * ```
 */
exports.createVolunteerUser = new query_1.PreparedQuery(createVolunteerUserIR);
const createUserVolunteerPartnerOrgInstanceIR = { "name": "createUserVolunteerPartnerOrgInstance", "params": [{ "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 27715, "b": 27721, "line": 1047, "col": 5 }] } }, { "name": "vpoName", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 27815, "b": 27822, "line": 1054, "col": 16 }] } }], "usedParamSet": { "userId": true, "vpoName": true }, "statement": { "body": "INSERT INTO users_volunteer_partner_orgs_instances (user_id, volunteer_partner_org_id, created_at, updated_at)\nSELECT\n    :userId!,\n    vpo.id,\n    NOW(),\n    NOW()\nFROM\n    volunteer_partner_orgs vpo\nWHERE\n    vpo.name = :vpoName!\nLIMIT 1\nRETURNING\n    user_id AS ok", "loc": { "a": 27592, "b": 27858, "line": 1045, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_volunteer_partner_orgs_instances (user_id, volunteer_partner_org_id, created_at, updated_at)
 * SELECT
 *     :userId!,
 *     vpo.id,
 *     NOW(),
 *     NOW()
 * FROM
 *     volunteer_partner_orgs vpo
 * WHERE
 *     vpo.name = :vpoName!
 * LIMIT 1
 * RETURNING
 *     user_id AS ok
 * ```
 */
exports.createUserVolunteerPartnerOrgInstance = new query_1.PreparedQuery(createUserVolunteerPartnerOrgInstanceIR);
const createVolunteerProfileIR = { "name": "createVolunteerProfile", "params": [{ "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 28022, "b": 28028, "line": 1062, "col": 13 }] } }, { "name": "partnerOrgId", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 28039, "b": 28050, "line": 1062, "col": 30 }] } }, { "name": "timezone", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 28054, "b": 28061, "line": 1062, "col": 45 }] } }], "usedParamSet": { "userId": true, "partnerOrgId": true, "timezone": true }, "statement": { "body": "INSERT INTO volunteer_profiles (user_id, approved, volunteer_partner_org_id, timezone, created_at, updated_at)\n    VALUES (:userId!, FALSE, :partnerOrgId, :timezone, NOW(), NOW())\nRETURNING\n    user_id AS ok", "loc": { "a": 27898, "b": 28104, "line": 1061, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO volunteer_profiles (user_id, approved, volunteer_partner_org_id, timezone, created_at, updated_at)
 *     VALUES (:userId!, FALSE, :partnerOrgId, :timezone, NOW(), NOW())
 * RETURNING
 *     user_id AS ok
 * ```
 */
exports.createVolunteerProfile = new query_1.PreparedQuery(createVolunteerProfileIR);
const getQuizzesForVolunteersIR = { "name": "getQuizzesForVolunteers", "params": [{ "name": "userIds", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 28392, "b": 28399, "line": 1079, "col": 20 }] } }], "usedParamSet": { "userIds": true }, "statement": { "body": "SELECT\n    user_id,\n    attempts AS tries,\n    users_quizzes.updated_at AS last_attempted_at,\n    passed,\n    quizzes.name,\n    quizzes.active\nFROM\n    users_quizzes\n    JOIN quizzes ON users_quizzes.quiz_id = quizzes.id\nWHERE\n    user_id = ANY (:userIds!)", "loc": { "a": 28145, "b": 28400, "line": 1068, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     user_id,
 *     attempts AS tries,
 *     users_quizzes.updated_at AS last_attempted_at,
 *     passed,
 *     quizzes.name,
 *     quizzes.active
 * FROM
 *     users_quizzes
 *     JOIN quizzes ON users_quizzes.quiz_id = quizzes.id
 * WHERE
 *     user_id = ANY (:userIds!)
 * ```
 */
exports.getQuizzesForVolunteers = new query_1.PreparedQuery(getQuizzesForVolunteersIR);
const getCertificationsForVolunteerIR = { "name": "getCertificationsForVolunteer", "params": [{ "name": "userIds", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 28717, "b": 28724, "line": 1092, "col": 20 }] } }], "usedParamSet": { "userIds": true }, "statement": { "body": "SELECT\n    user_id,\n    users_certifications.updated_at AS last_attempted_at,\n    certifications.name,\n    certifications.active\nFROM\n    users_certifications\n    JOIN certifications ON users_certifications.certification_id = certifications.id\nWHERE\n    user_id = ANY (:userIds!)", "loc": { "a": 28447, "b": 28725, "line": 1083, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     user_id,
 *     users_certifications.updated_at AS last_attempted_at,
 *     certifications.name,
 *     certifications.active
 * FROM
 *     users_certifications
 *     JOIN certifications ON users_certifications.certification_id = certifications.id
 * WHERE
 *     user_id = ANY (:userIds!)
 * ```
 */
exports.getCertificationsForVolunteer = new query_1.PreparedQuery(getCertificationsForVolunteerIR);
const getActiveQuizzesForVolunteersIR = { "name": "getActiveQuizzesForVolunteers", "params": [{ "name": "userIds", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 28999, "b": 29006, "line": 1106, "col": 20 }] } }], "usedParamSet": { "userIds": true }, "statement": { "body": "SELECT\n    user_id,\n    attempts AS tries,\n    users_quizzes.updated_at AS last_attempted_at,\n    passed,\n    quizzes.name\nFROM\n    users_quizzes\n    JOIN quizzes ON users_quizzes.quiz_id = quizzes.id\nWHERE\n    user_id = ANY (:userIds!)\n    AND quizzes.active IS TRUE", "loc": { "a": 28772, "b": 29038, "line": 1096, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     user_id,
 *     attempts AS tries,
 *     users_quizzes.updated_at AS last_attempted_at,
 *     passed,
 *     quizzes.name
 * FROM
 *     users_quizzes
 *     JOIN quizzes ON users_quizzes.quiz_id = quizzes.id
 * WHERE
 *     user_id = ANY (:userIds!)
 *     AND quizzes.active IS TRUE
 * ```
 */
exports.getActiveQuizzesForVolunteers = new query_1.PreparedQuery(getActiveQuizzesForVolunteersIR);
const getSubjectsForVolunteerIR = { "name": "getSubjectsForVolunteer", "params": [{ "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 29788, "b": 29794, "line": 1134, "col": 19 }] } }], "usedParamSet": { "userId": true }, "statement": { "body": "WITH subject_cert_total AS (\n    SELECT\n        subjects.name,\n        COUNT(*)::int AS total\n    FROM\n        certification_subject_unlocks\n        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n    GROUP BY\n        subjects.name\n)\nSELECT\n    subjects_unlocked.subject\nFROM (\n    SELECT\n        subjects.name AS subject,\n        COUNT(*)::int AS earned_certs,\n        subject_cert_total.total\n    FROM\n        users_certifications\n        JOIN certification_subject_unlocks USING (certification_id)\n        JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n        JOIN subject_cert_total ON subject_cert_total.name = subjects.name\n    WHERE\n        user_id = :userId!\n    GROUP BY\n        subjects.name, subject_cert_total.total\n    HAVING\n        COUNT(*)::int >= subject_cert_total.total) AS subjects_unlocked", "loc": { "a": 29079, "b": 29938, "line": 1111, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * WITH subject_cert_total AS (
 *     SELECT
 *         subjects.name,
 *         COUNT(*)::int AS total
 *     FROM
 *         certification_subject_unlocks
 *         JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
 *     GROUP BY
 *         subjects.name
 * )
 * SELECT
 *     subjects_unlocked.subject
 * FROM (
 *     SELECT
 *         subjects.name AS subject,
 *         COUNT(*)::int AS earned_certs,
 *         subject_cert_total.total
 *     FROM
 *         users_certifications
 *         JOIN certification_subject_unlocks USING (certification_id)
 *         JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
 *         JOIN subject_cert_total ON subject_cert_total.name = subjects.name
 *     WHERE
 *         user_id = :userId!
 *     GROUP BY
 *         subjects.name, subject_cert_total.total
 *     HAVING
 *         COUNT(*)::int >= subject_cert_total.total) AS subjects_unlocked
 * ```
 */
exports.getSubjectsForVolunteer = new query_1.PreparedQuery(getSubjectsForVolunteerIR);
const getNextVolunteerToNotifyIR = { "name": "getNextVolunteerToNotify", "params": [{ "name": "subject", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 33186, "b": 33193, "line": 1218, "col": 14 }, { "a": 33246, "b": 33253, "line": 1219, "col": 16 }] } }, { "name": "highLevelSubjects", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 33382, "b": 33398, "line": 1221, "col": 14 }, { "a": 33434, "b": 33450, "line": 1222, "col": 17 }] } }, { "name": "disqualifiedVolunteers", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 33616, "b": 33637, "line": 1224, "col": 14 }, { "a": 33692, "b": 33713, "line": 1225, "col": 36 }] } }, { "name": "favoriteVolunteers", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 33777, "b": 33794, "line": 1227, "col": 14 }, { "a": 33845, "b": 33862, "line": 1228, "col": 32 }] } }, { "name": "isPartner", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 33921, "b": 33929, "line": 1230, "col": 14 }, { "a": 33966, "b": 33974, "line": 1231, "col": 17 }, { "a": 34075, "b": 34083, "line": 1233, "col": 17 }] } }, { "name": "specificPartner", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 34186, "b": 34200, "line": 1235, "col": 15 }, { "a": 34262, "b": 34276, "line": 1236, "col": 45 }] } }, { "name": "lastNotified", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 34479, "b": 34491, "line": 1244, "col": 32 }] } }], "usedParamSet": { "subject": true, "highLevelSubjects": true, "disqualifiedVolunteers": true, "favoriteVolunteers": true, "isPartner": true, "specificPartner": true, "lastNotified": true }, "statement": { "body": "WITH subject_totals AS (\n    SELECT\n        subjects.name,\n        COUNT(*)::int AS total\n    FROM\n        certification_subject_unlocks\n        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n    GROUP BY\n        subjects.name\n),\ncomputed_subject_totals AS (\n    SELECT\n        subjects.name,\n        COUNT(*)::int AS total\n    FROM\n        computed_subject_unlocks\n        JOIN subjects ON subjects.id = computed_subject_unlocks.subject_id\n    GROUP BY\n        subjects.name\n),\ncandidates AS (\n    SELECT\n        users.id,\n        first_name,\n        last_name,\n        phone,\n        email,\n        volunteer_partner_orgs.key AS volunteer_partner_org\n    FROM\n        users\n        JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n        JOIN availabilities ON users.id = availabilities.user_id\n        JOIN weekdays ON weekdays.id = availabilities.weekday_id\n        LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n        LEFT JOIN LATERAL (\n            SELECT\n                array_agg(sub_unlocked.subject)::text[] AS subjects\n            FROM (\n                SELECT\n                    subjects.name AS subject\n                FROM\n                    users_certifications\n                    JOIN certification_subject_unlocks USING (certification_id)\n                    JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n                    JOIN subject_totals ON subject_totals.name = subjects.name\n                WHERE\n                    users_certifications.user_id = users.id\n                GROUP BY\n                    user_id, subjects.name, subject_totals.total) AS sub_unlocked) AS subjects_unlocked ON TRUE\n        LEFT JOIN LATERAL (\n            SELECT\n                array_agg(sub_unlocked.subject)::text[] AS subjects\n            FROM (\n                SELECT\n                    subjects.name AS subject\n                FROM\n                    users_certifications\n                    JOIN computed_subject_unlocks USING (certification_id)\n                    JOIN subjects ON computed_subject_unlocks.subject_id = subjects.id\n                    JOIN computed_subject_totals ON computed_subject_totals.name = subjects.name\n                WHERE\n                    users_certifications.user_id = users.id\n                GROUP BY\n                    user_id, subjects.name, computed_subject_totals.total\n                HAVING\n                    COUNT(*)::int >= computed_subject_totals.total) AS sub_unlocked) AS computed_subjects_unlocked ON TRUE\n    WHERE\n        test_user IS FALSE\n        AND banned IS FALSE\n        AND deactivated IS FALSE\n        AND volunteer_profiles.onboarded IS TRUE\n        AND volunteer_profiles.approved IS TRUE\n        -- availabilities are all stored in EST so convert server time to EST to be safe\n        AND TRIM(BOTH FROM to_char(NOW() at time zone 'America/New_York', 'Day')) = weekdays.day\n        AND extract(hour FROM (NOW() at time zone 'America/New_York')) >= availabilities.available_start\n        AND extract(hour FROM (NOW() at time zone 'America/New_York')) < availabilities.available_end\n        AND (:subject! = ANY (subjects_unlocked.subjects)\n            OR :subject! = ANY (computed_subjects_unlocked.subjects))\n        AND ( -- user does not have high level subjects if provided\n            (:highLevelSubjects)::text[] IS NULL\n            OR (:highLevelSubjects)::text[] && subjects_unlocked.subjects IS FALSE)\n        AND ( -- user is not part of disqualified group (like active session volunteers) if provided\n            (:disqualifiedVolunteers)::uuid[] IS NULL\n            OR NOT users.id = ANY (:disqualifiedVolunteers))\n        AND ( -- user is a favorite volunteer\n            (:favoriteVolunteers)::uuid[] IS NULL\n            OR users.id = ANY (:favoriteVolunteers))\n        AND ( -- user is partner or open\n            (:isPartner)::boolean IS NULL\n            OR (:isPartner IS FALSE\n                AND volunteer_profiles.volunteer_partner_org_id IS NULL)\n            OR (:isPartner IS TRUE\n                AND NOT volunteer_profiles.volunteer_partner_org_id IS NULL))\n        AND ((:specificPartner)::text IS NULL\n            OR volunteer_partner_orgs.key = :specificPartner)\n        AND NOT EXISTS (\n            SELECT\n                user_id\n            FROM\n                notifications\n            WHERE\n                user_id = users.id\n                AND sent_at >= :lastNotified!))\nSELECT\n    *\nFROM\n    candidates\nORDER BY\n    RANDOM()\nLIMIT 1", "loc": { "a": 29980, "b": 34556, "line": 1142, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * WITH subject_totals AS (
 *     SELECT
 *         subjects.name,
 *         COUNT(*)::int AS total
 *     FROM
 *         certification_subject_unlocks
 *         JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
 *     GROUP BY
 *         subjects.name
 * ),
 * computed_subject_totals AS (
 *     SELECT
 *         subjects.name,
 *         COUNT(*)::int AS total
 *     FROM
 *         computed_subject_unlocks
 *         JOIN subjects ON subjects.id = computed_subject_unlocks.subject_id
 *     GROUP BY
 *         subjects.name
 * ),
 * candidates AS (
 *     SELECT
 *         users.id,
 *         first_name,
 *         last_name,
 *         phone,
 *         email,
 *         volunteer_partner_orgs.key AS volunteer_partner_org
 *     FROM
 *         users
 *         JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *         JOIN availabilities ON users.id = availabilities.user_id
 *         JOIN weekdays ON weekdays.id = availabilities.weekday_id
 *         LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 *         LEFT JOIN LATERAL (
 *             SELECT
 *                 array_agg(sub_unlocked.subject)::text[] AS subjects
 *             FROM (
 *                 SELECT
 *                     subjects.name AS subject
 *                 FROM
 *                     users_certifications
 *                     JOIN certification_subject_unlocks USING (certification_id)
 *                     JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
 *                     JOIN subject_totals ON subject_totals.name = subjects.name
 *                 WHERE
 *                     users_certifications.user_id = users.id
 *                 GROUP BY
 *                     user_id, subjects.name, subject_totals.total) AS sub_unlocked) AS subjects_unlocked ON TRUE
 *         LEFT JOIN LATERAL (
 *             SELECT
 *                 array_agg(sub_unlocked.subject)::text[] AS subjects
 *             FROM (
 *                 SELECT
 *                     subjects.name AS subject
 *                 FROM
 *                     users_certifications
 *                     JOIN computed_subject_unlocks USING (certification_id)
 *                     JOIN subjects ON computed_subject_unlocks.subject_id = subjects.id
 *                     JOIN computed_subject_totals ON computed_subject_totals.name = subjects.name
 *                 WHERE
 *                     users_certifications.user_id = users.id
 *                 GROUP BY
 *                     user_id, subjects.name, computed_subject_totals.total
 *                 HAVING
 *                     COUNT(*)::int >= computed_subject_totals.total) AS sub_unlocked) AS computed_subjects_unlocked ON TRUE
 *     WHERE
 *         test_user IS FALSE
 *         AND banned IS FALSE
 *         AND deactivated IS FALSE
 *         AND volunteer_profiles.onboarded IS TRUE
 *         AND volunteer_profiles.approved IS TRUE
 *         -- availabilities are all stored in EST so convert server time to EST to be safe
 *         AND TRIM(BOTH FROM to_char(NOW() at time zone 'America/New_York', 'Day')) = weekdays.day
 *         AND extract(hour FROM (NOW() at time zone 'America/New_York')) >= availabilities.available_start
 *         AND extract(hour FROM (NOW() at time zone 'America/New_York')) < availabilities.available_end
 *         AND (:subject! = ANY (subjects_unlocked.subjects)
 *             OR :subject! = ANY (computed_subjects_unlocked.subjects))
 *         AND ( -- user does not have high level subjects if provided
 *             (:highLevelSubjects)::text[] IS NULL
 *             OR (:highLevelSubjects)::text[] && subjects_unlocked.subjects IS FALSE)
 *         AND ( -- user is not part of disqualified group (like active session volunteers) if provided
 *             (:disqualifiedVolunteers)::uuid[] IS NULL
 *             OR NOT users.id = ANY (:disqualifiedVolunteers))
 *         AND ( -- user is a favorite volunteer
 *             (:favoriteVolunteers)::uuid[] IS NULL
 *             OR users.id = ANY (:favoriteVolunteers))
 *         AND ( -- user is partner or open
 *             (:isPartner)::boolean IS NULL
 *             OR (:isPartner IS FALSE
 *                 AND volunteer_profiles.volunteer_partner_org_id IS NULL)
 *             OR (:isPartner IS TRUE
 *                 AND NOT volunteer_profiles.volunteer_partner_org_id IS NULL))
 *         AND ((:specificPartner)::text IS NULL
 *             OR volunteer_partner_orgs.key = :specificPartner)
 *         AND NOT EXISTS (
 *             SELECT
 *                 user_id
 *             FROM
 *                 notifications
 *             WHERE
 *                 user_id = users.id
 *                 AND sent_at >= :lastNotified!))
 * SELECT
 *     *
 * FROM
 *     candidates
 * ORDER BY
 *     RANDOM()
 * LIMIT 1
 * ```
 */
exports.getNextVolunteerToNotify = new query_1.PreparedQuery(getNextVolunteerToNotifyIR);
const checkIfVolunteerMutedSubjectIR = { "name": "checkIfVolunteerMutedSubject", "params": [{ "name": "userId", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 34778, "b": 34783, "line": 1261, "col": 42 }] } }, { "name": "subjectName", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 34810, "b": 34820, "line": 1262, "col": 25 }] } }], "usedParamSet": { "userId": true, "subjectName": true }, "statement": { "body": "SELECT\n    user_id\nFROM\n    muted_users_subject_alerts\n    JOIN subjects ON muted_users_subject_alerts.subject_id = subjects.id\nWHERE\n    muted_users_subject_alerts.user_id = :userId\n    AND subjects.name = :subjectName", "loc": { "a": 34602, "b": 34820, "line": 1255, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     user_id
 * FROM
 *     muted_users_subject_alerts
 *     JOIN subjects ON muted_users_subject_alerts.subject_id = subjects.id
 * WHERE
 *     muted_users_subject_alerts.user_id = :userId
 *     AND subjects.name = :subjectName
 * ```
 */
exports.checkIfVolunteerMutedSubject = new query_1.PreparedQuery(checkIfVolunteerMutedSubjectIR);
const getVolunteerForScheduleUpdateIR = { "name": "getVolunteerForScheduleUpdate", "params": [{ "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 36202, "b": 36208, "line": 1301, "col": 16 }] } }], "usedParamSet": { "userId": true }, "statement": { "body": "SELECT\n    users.id,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    volunteer_profiles.onboarded,\n    subjects_unlocked.subjects,\n    COALESCE(training_quizzes.passed, FALSE) AS passed_required_training\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN LATERAL (\n        SELECT\n            array_agg(sub_unlocked.subject) AS subjects\n        FROM (\n            SELECT\n                user_id,\n                subjects.name AS subject\n            FROM\n                users_certifications\n                JOIN certification_subject_unlocks USING (certification_id)\n                JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n            WHERE\n                users_certifications.user_id = users.id\n            GROUP BY\n                user_id, subjects.name) AS sub_unlocked) AS subjects_unlocked ON TRUE\n    LEFT JOIN (\n        SELECT\n            passed,\n            user_id\n        FROM\n            users_quizzes\n            JOIN quizzes ON users_quizzes.quiz_id = quizzes.id\n        WHERE\n            quizzes.name = 'upchieve101') AS training_quizzes ON training_quizzes.user_id = volunteer_profiles.user_id\nWHERE\n    users.id = :userId!\nLIMIT 1", "loc": { "a": 34867, "b": 36216, "line": 1266, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     volunteer_partner_orgs.key AS volunteer_partner_org,
 *     volunteer_profiles.onboarded,
 *     subjects_unlocked.subjects,
 *     COALESCE(training_quizzes.passed, FALSE) AS passed_required_training
 * FROM
 *     users
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             array_agg(sub_unlocked.subject) AS subjects
 *         FROM (
 *             SELECT
 *                 user_id,
 *                 subjects.name AS subject
 *             FROM
 *                 users_certifications
 *                 JOIN certification_subject_unlocks USING (certification_id)
 *                 JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
 *             WHERE
 *                 users_certifications.user_id = users.id
 *             GROUP BY
 *                 user_id, subjects.name) AS sub_unlocked) AS subjects_unlocked ON TRUE
 *     LEFT JOIN (
 *         SELECT
 *             passed,
 *             user_id
 *         FROM
 *             users_quizzes
 *             JOIN quizzes ON users_quizzes.quiz_id = quizzes.id
 *         WHERE
 *             quizzes.name = 'upchieve101') AS training_quizzes ON training_quizzes.user_id = volunteer_profiles.user_id
 * WHERE
 *     users.id = :userId!
 * LIMIT 1
 * ```
 */
exports.getVolunteerForScheduleUpdate = new query_1.PreparedQuery(getVolunteerForScheduleUpdateIR);
const getVolunteersOnDeckIR = { "name": "getVolunteersOnDeck", "params": [{ "name": "excludedIds", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 39274, "b": 39285, "line": 1379, "col": 29 }] } }, { "name": "subject", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 39624, "b": 39631, "line": 1383, "col": 38 }, { "a": 39682, "b": 39689, "line": 1384, "col": 49 }] } }], "usedParamSet": { "excludedIds": true, "subject": true }, "statement": { "body": "SELECT\n    users.id,\n    first_name,\n    last_name,\n    phone,\n    email,\n    volunteer_partner_orgs.key AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    JOIN availabilities ON users.id = availabilities.user_id\n    JOIN weekdays ON weekdays.id = availabilities.weekday_id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN (\n        SELECT\n            sub_unlocked.user_id,\n            subjects.name AS subject\n        FROM (\n            SELECT\n                user_id,\n                subjects.name AS subject,\n                COUNT(*)::int AS earned_certs,\n                subject_total.total\n            FROM\n                users_certifications\n                JOIN certification_subject_unlocks USING (certification_id)\n                JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n                JOIN (\n                    SELECT\n                        subjects.name, COUNT(*)::int AS total\n                    FROM\n                        certification_subject_unlocks\n                        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n                    GROUP BY\n                        subjects.name) AS subject_total ON subject_total.name = subjects.name\n                GROUP BY\n                    user_id,\n                    subjects.name,\n                    subject_total.total) AS sub_unlocked\n                JOIN subjects ON sub_unlocked.subject = subjects.name) AS subjects_unlocked ON subjects_unlocked.user_id = users.id\n    LEFT JOIN (\n        SELECT\n            sub_unlocked.user_id,\n            subjects.name AS subject\n        FROM (\n            SELECT\n                user_id,\n                subjects.name AS subject,\n                COUNT(*)::int AS earned_certs,\n                subject_total.total\n            FROM\n                users_certifications\n                JOIN computed_subject_unlocks USING (certification_id)\n                JOIN subjects ON computed_subject_unlocks.subject_id = subjects.id\n                JOIN (\n                    SELECT\n                        subjects.name, COUNT(*)::int AS total\n                    FROM\n                        computed_subject_unlocks\n                        JOIN subjects ON subjects.id = computed_subject_unlocks.subject_id\n                    GROUP BY\n                        subjects.name) AS subject_total ON subject_total.name = subjects.name\n                GROUP BY\n                    user_id,\n                    subjects.name,\n                    subject_total.total\n                HAVING\n                    COUNT(*)::int >= subject_total.total) AS sub_unlocked\n                JOIN subjects ON sub_unlocked.subject = subjects.name) AS computed_subjects_unlocked ON computed_subjects_unlocked.user_id = users.id\nWHERE\n    test_user IS FALSE\n    AND banned IS FALSE\n    AND deactivated IS FALSE\n    AND NOT users.id = ANY (:excludedIds!)\nAND TRIM(BOTH FROM to_char(NOW() at time zone 'America/New_York', 'Day')) = weekdays.day\n    AND extract(hour FROM (now() at time zone availabilities.timezone)) >= availabilities.available_start\n    AND extract(hour FROM (now() at time zone availabilities.timezone)) < availabilities.available_end\n    AND (subjects_unlocked.subject = :subject!\n        OR computed_subjects_unlocked.subject = :subject!)\nGROUP BY\n    users.id,\n    volunteer_partner_orgs.key", "loc": { "a": 36253, "b": 39744, "line": 1306, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id,
 *     first_name,
 *     last_name,
 *     phone,
 *     email,
 *     volunteer_partner_orgs.key AS volunteer_partner_org
 * FROM
 *     users
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     JOIN availabilities ON users.id = availabilities.user_id
 *     JOIN weekdays ON weekdays.id = availabilities.weekday_id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 *     LEFT JOIN (
 *         SELECT
 *             sub_unlocked.user_id,
 *             subjects.name AS subject
 *         FROM (
 *             SELECT
 *                 user_id,
 *                 subjects.name AS subject,
 *                 COUNT(*)::int AS earned_certs,
 *                 subject_total.total
 *             FROM
 *                 users_certifications
 *                 JOIN certification_subject_unlocks USING (certification_id)
 *                 JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
 *                 JOIN (
 *                     SELECT
 *                         subjects.name, COUNT(*)::int AS total
 *                     FROM
 *                         certification_subject_unlocks
 *                         JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
 *                     GROUP BY
 *                         subjects.name) AS subject_total ON subject_total.name = subjects.name
 *                 GROUP BY
 *                     user_id,
 *                     subjects.name,
 *                     subject_total.total) AS sub_unlocked
 *                 JOIN subjects ON sub_unlocked.subject = subjects.name) AS subjects_unlocked ON subjects_unlocked.user_id = users.id
 *     LEFT JOIN (
 *         SELECT
 *             sub_unlocked.user_id,
 *             subjects.name AS subject
 *         FROM (
 *             SELECT
 *                 user_id,
 *                 subjects.name AS subject,
 *                 COUNT(*)::int AS earned_certs,
 *                 subject_total.total
 *             FROM
 *                 users_certifications
 *                 JOIN computed_subject_unlocks USING (certification_id)
 *                 JOIN subjects ON computed_subject_unlocks.subject_id = subjects.id
 *                 JOIN (
 *                     SELECT
 *                         subjects.name, COUNT(*)::int AS total
 *                     FROM
 *                         computed_subject_unlocks
 *                         JOIN subjects ON subjects.id = computed_subject_unlocks.subject_id
 *                     GROUP BY
 *                         subjects.name) AS subject_total ON subject_total.name = subjects.name
 *                 GROUP BY
 *                     user_id,
 *                     subjects.name,
 *                     subject_total.total
 *                 HAVING
 *                     COUNT(*)::int >= subject_total.total) AS sub_unlocked
 *                 JOIN subjects ON sub_unlocked.subject = subjects.name) AS computed_subjects_unlocked ON computed_subjects_unlocked.user_id = users.id
 * WHERE
 *     test_user IS FALSE
 *     AND banned IS FALSE
 *     AND deactivated IS FALSE
 *     AND NOT users.id = ANY (:excludedIds!)
 * AND TRIM(BOTH FROM to_char(NOW() at time zone 'America/New_York', 'Day')) = weekdays.day
 *     AND extract(hour FROM (now() at time zone availabilities.timezone)) >= availabilities.available_start
 *     AND extract(hour FROM (now() at time zone availabilities.timezone)) < availabilities.available_end
 *     AND (subjects_unlocked.subject = :subject!
 *         OR computed_subjects_unlocked.subject = :subject!)
 * GROUP BY
 *     users.id,
 *     volunteer_partner_orgs.key
 * ```
 */
exports.getVolunteersOnDeck = new query_1.PreparedQuery(getVolunteersOnDeckIR);
const getUniqueStudentsHelpedForAnalyticsReportSummaryIR = { "name": "getUniqueStudentsHelpedForAnalyticsReportSummary", "params": [{ "name": "start", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 39970, "b": 39975, "line": 1393, "col": 62 }, { "a": 40567, "b": 40572, "line": 1405, "col": 62 }] } }, { "name": "end", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 40021, "b": 40024, "line": 1394, "col": 44 }, { "a": 40618, "b": 40621, "line": 1406, "col": 44 }] } }, { "name": "studentPartnerOrgIds", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 40263, "b": 40283, "line": 1399, "col": 86 }, { "a": 40692, "b": 40712, "line": 1407, "col": 69 }] } }, { "name": "studentSchoolIds", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 40340, "b": 40356, "line": 1400, "col": 54 }, { "a": 40773, "b": 40789, "line": 1408, "col": 58 }] } }, { "name": "volunteerPartnerOrg", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 41289, "b": 41308, "line": 1419, "col": 34 }] } }], "usedParamSet": { "start": true, "end": true, "studentPartnerOrgIds": true, "studentSchoolIds": true, "volunteerPartnerOrg": true }, "statement": { "body": "SELECT\n    COALESCE(COUNT(DISTINCT sessions.student_id), 0)::int AS total_unique_students_helped,\n    COALESCE(COUNT(DISTINCT CASE WHEN sessions.created_at >= :start!\n                AND sessions.created_at <= :end! THEN\n                sessions.student_id\n            ELSE\n                NULL\n            END), 0)::int AS total_unique_students_helped_within_range,\n    COALESCE(COUNT(DISTINCT CASE WHEN student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                OR student_profiles.school_id = ANY (:studentSchoolIds!) THEN\n                sessions.student_id\n            ELSE\n                NULL\n            END), 0)::int AS total_unique_partner_students_helped,\n    COALESCE(COUNT(DISTINCT CASE WHEN sessions.created_at >= :start!\n                AND sessions.created_at <= :end!\n                AND (student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                    OR student_profiles.school_id = ANY (:studentSchoolIds!)) THEN\n                sessions.student_id\n            ELSE\n                NULL\n            END), 0)::int AS total_unique_partner_students_helped_within_range\nFROM\n    volunteer_partner_orgs\n    LEFT JOIN volunteer_profiles ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    LEFT JOIN sessions ON volunteer_profiles.user_id = sessions.volunteer_id\n    LEFT JOIN student_profiles ON sessions.student_id = student_profiles.user_id\nWHERE\n    volunteer_partner_orgs.key = :volunteerPartnerOrg!", "loc": { "a": 39810, "b": 41308, "line": 1391, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     COALESCE(COUNT(DISTINCT sessions.student_id), 0)::int AS total_unique_students_helped,
 *     COALESCE(COUNT(DISTINCT CASE WHEN sessions.created_at >= :start!
 *                 AND sessions.created_at <= :end! THEN
 *                 sessions.student_id
 *             ELSE
 *                 NULL
 *             END), 0)::int AS total_unique_students_helped_within_range,
 *     COALESCE(COUNT(DISTINCT CASE WHEN student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)
 *                 OR student_profiles.school_id = ANY (:studentSchoolIds!) THEN
 *                 sessions.student_id
 *             ELSE
 *                 NULL
 *             END), 0)::int AS total_unique_partner_students_helped,
 *     COALESCE(COUNT(DISTINCT CASE WHEN sessions.created_at >= :start!
 *                 AND sessions.created_at <= :end!
 *                 AND (student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)
 *                     OR student_profiles.school_id = ANY (:studentSchoolIds!)) THEN
 *                 sessions.student_id
 *             ELSE
 *                 NULL
 *             END), 0)::int AS total_unique_partner_students_helped_within_range
 * FROM
 *     volunteer_partner_orgs
 *     LEFT JOIN volunteer_profiles ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 *     LEFT JOIN sessions ON volunteer_profiles.user_id = sessions.volunteer_id
 *     LEFT JOIN student_profiles ON sessions.student_id = student_profiles.user_id
 * WHERE
 *     volunteer_partner_orgs.key = :volunteerPartnerOrg!
 * ```
 */
exports.getUniqueStudentsHelpedForAnalyticsReportSummary = new query_1.PreparedQuery(getUniqueStudentsHelpedForAnalyticsReportSummaryIR);
const getVolunteersForAnalyticsReportIR = { "name": "getVolunteersForAnalyticsReport", "params": [{ "name": "start", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 44106, "b": 44111, "line": 1480, "col": 61 }, { "a": 44724, "b": 44729, "line": 1492, "col": 61 }, { "a": 45200, "b": 45205, "line": 1501, "col": 50 }, { "a": 45769, "b": 45774, "line": 1515, "col": 50 }, { "a": 46551, "b": 46556, "line": 1531, "col": 50 }, { "a": 47284, "b": 47289, "line": 1548, "col": 38 }] } }, { "name": "end", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 44161, "b": 44164, "line": 1481, "col": 48 }, { "a": 44779, "b": 44782, "line": 1493, "col": 48 }, { "a": 45255, "b": 45258, "line": 1502, "col": 48 }, { "a": 45824, "b": 45827, "line": 1516, "col": 48 }, { "a": 46606, "b": 46609, "line": 1532, "col": 48 }, { "a": 47327, "b": 47330, "line": 1549, "col": 36 }] } }, { "name": "studentPartnerOrgIds", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 44405, "b": 44425, "line": 1486, "col": 85 }, { "a": 44857, "b": 44877, "line": 1494, "col": 73 }, { "a": 45479, "b": 45499, "line": 1508, "col": 74 }, { "a": 45902, "b": 45922, "line": 1517, "col": 73 }, { "a": 46234, "b": 46254, "line": 1524, "col": 74 }, { "a": 46684, "b": 46704, "line": 1533, "col": 73 }] } }, { "name": "studentSchoolIds", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 44486, "b": 44502, "line": 1487, "col": 58 }, { "a": 44942, "b": 44958, "line": 1495, "col": 62 }, { "a": 45560, "b": 45576, "line": 1509, "col": 58 }, { "a": 45987, "b": 46003, "line": 1518, "col": 62 }, { "a": 46315, "b": 46331, "line": 1525, "col": 58 }, { "a": 46769, "b": 46785, "line": 1534, "col": 62 }] } }, { "name": "volunteerPartnerOrg", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 47630, "b": 47649, "line": 1559, "col": 34 }] } }, { "name": "cursor", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 47661, "b": 47666, "line": 1560, "col": 10 }, { "a": 47706, "b": 47711, "line": 1561, "col": 24 }] } }, { "name": "pageSize", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 47755, "b": 47763, "line": 1564, "col": 8 }] } }], "usedParamSet": { "start": true, "end": true, "studentPartnerOrgIds": true, "studentSchoolIds": true, "volunteerPartnerOrg": true, "cursor": true, "pageSize": true }, "statement": { "body": "SELECT\n    users.id AS user_id,\n    users.first_name AS first_name,\n    users.last_name AS last_name,\n    users.email AS email,\n    users.created_at AS created_at,\n    volunteer_profiles.state AS state,\n    volunteer_profiles.onboarded AS is_onboarded,\n    user_actions.created_at AS date_onboarded,\n    COALESCE(users_quizzes.total, 0) AS total_quizzes_passed,\n    availabilities.updated_at AS availability_last_modified_at,\n    COALESCE(sessions_stats.total_unique_students_helped, 0) AS total_unique_students_helped,\n    COALESCE(sessions_stats.total_unique_students_helped_within_range, 0) AS total_unique_students_helped_within_range,\n    COALESCE(sessions_stats.total_unique_partner_students_helped, 0) AS total_unique_partner_students_helped,\n    COALESCE(sessions_stats.total_unique_partner_students_helped_within_range, 0) AS total_unique_partner_students_helped_within_range,\n    COALESCE(sessions_stats.total_sessions, 0) AS total_sessions,\n    COALESCE(sessions_stats.total_sessions_within_range, 0) AS total_sessions_within_range,\n    COALESCE(sessions_stats.total_partner_sessions, 0) AS total_partner_sessions,\n    COALESCE(sessions_stats.total_partner_sessions_within_range, 0) AS total_partner_sessions_within_range,\n    COALESCE(sessions_stats.total_partner_time_tutored, 0) AS total_partner_time_tutored,\n    COALESCE(sessions_stats.total_partner_time_tutored_within_range, 0) AS total_partner_time_tutored_within_range,\n    COALESCE(notifications_stats.total, 0) AS total_notifications,\n    COALESCE(notifications_stats.total_within_range, 0) AS total_notifications_within_range\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_profiles.volunteer_partner_org_id = volunteer_partner_orgs.id\n    LEFT JOIN (\n        SELECT\n            COUNT(*)::int AS total,\n            user_id\n        FROM\n            users_quizzes\n        WHERE\n            passed = TRUE\n        GROUP BY\n            user_id) AS users_quizzes ON users_quizzes.user_id = volunteer_profiles.user_id\n    LEFT JOIN (\n        SELECT\n            MAX(updated_at) AS updated_at,\n            user_id\n        FROM\n            availabilities\n        GROUP BY\n            user_id) AS availabilities ON availabilities.user_id = users.id\n    LEFT JOIN (\n        SELECT\n            created_at,\n            user_id\n        FROM\n            user_actions\n        WHERE\n            action = 'ONBOARDED') AS user_actions ON user_actions.user_id = volunteer_profiles.user_id\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(*)::int AS total_sessions,\n            COUNT(DISTINCT student_id)::int AS total_unique_students_helped,\n            COUNT(DISTINCT CASE WHEN sessions.created_at >= :start!\n                    AND sessions.created_at <= :end! THEN\n                    student_id\n                ELSE\n                    NULL\n                END)::int AS total_unique_students_helped_within_range,\n            COUNT(DISTINCT CASE WHEN student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                    OR student_profiles.school_id = ANY (:studentSchoolIds!) THEN\n                    sessions.student_id\n                ELSE\n                    NULL\n                END)::int AS total_unique_partner_students_helped,\n            COUNT(DISTINCT CASE WHEN sessions.created_at >= :start!\n                    AND sessions.created_at <= :end!\n                    AND (student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                        OR student_profiles.school_id = ANY (:studentSchoolIds!)) THEN\n                    sessions.student_id\n                ELSE\n                    NULL\n                END)::int AS total_unique_partner_students_helped_within_range,\n            SUM(\n                CASE WHEN sessions.created_at >= :start!\n                    AND sessions.created_at <= :end! THEN\n                    1\n                ELSE\n                    0\n                END)::int AS total_sessions_within_range,\n            SUM(\n                CASE WHEN student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                    OR student_profiles.school_id = ANY (:studentSchoolIds!) THEN\n                    1\n                ELSE\n                    0\n                END)::int AS total_partner_sessions,\n            SUM(\n                CASE WHEN sessions.created_at >= :start!\n                    AND sessions.created_at <= :end!\n                    AND (student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                        OR student_profiles.school_id = ANY (:studentSchoolIds!)) THEN\n                    1\n                ELSE\n                    0\n                END)::int AS total_partner_sessions_within_range,\n            SUM(\n                CASE WHEN student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                    OR student_profiles.school_id = ANY (:studentSchoolIds!) THEN\n                    sessions.time_tutored\n                ELSE\n                    0\n                END)::bigint AS total_partner_time_tutored,\n            SUM(\n                CASE WHEN sessions.created_at >= :start!\n                    AND sessions.created_at <= :end!\n                    AND (student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)\n                        OR student_profiles.school_id = ANY (:studentSchoolIds!)) THEN\n                    sessions.time_tutored\n                ELSE\n                    0\n                END)::bigint AS total_partner_time_tutored_within_range\n        FROM\n            sessions\n    LEFT JOIN student_profiles ON sessions.student_id = student_profiles.user_id\nWHERE\n    volunteer_profiles.user_id = sessions.volunteer_id) AS sessions_stats ON TRUE\n    LEFT JOIN LATERAL (\n        SELECT\n            COUNT(*)::int AS total,\n            SUM(\n                CASE WHEN sent_at >= :start!\n                    AND sent_at <= :end! THEN\n                    1\n                ELSE\n                    0\n                END)::int AS total_within_range\n        FROM\n            notifications\n    WHERE\n        volunteer_profiles.user_id = notifications.user_id) AS notifications_stats ON TRUE\nWHERE\n    volunteer_partner_orgs.key = :volunteerPartnerOrg!\n    AND (:cursor::uuid IS NULL\n        OR users.id <= :cursor::uuid)\nORDER BY\n    users.id DESC\nLIMIT (:pageSize!::int)", "loc": { "a": 41357, "b": 47769, "line": 1423, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.id AS user_id,
 *     users.first_name AS first_name,
 *     users.last_name AS last_name,
 *     users.email AS email,
 *     users.created_at AS created_at,
 *     volunteer_profiles.state AS state,
 *     volunteer_profiles.onboarded AS is_onboarded,
 *     user_actions.created_at AS date_onboarded,
 *     COALESCE(users_quizzes.total, 0) AS total_quizzes_passed,
 *     availabilities.updated_at AS availability_last_modified_at,
 *     COALESCE(sessions_stats.total_unique_students_helped, 0) AS total_unique_students_helped,
 *     COALESCE(sessions_stats.total_unique_students_helped_within_range, 0) AS total_unique_students_helped_within_range,
 *     COALESCE(sessions_stats.total_unique_partner_students_helped, 0) AS total_unique_partner_students_helped,
 *     COALESCE(sessions_stats.total_unique_partner_students_helped_within_range, 0) AS total_unique_partner_students_helped_within_range,
 *     COALESCE(sessions_stats.total_sessions, 0) AS total_sessions,
 *     COALESCE(sessions_stats.total_sessions_within_range, 0) AS total_sessions_within_range,
 *     COALESCE(sessions_stats.total_partner_sessions, 0) AS total_partner_sessions,
 *     COALESCE(sessions_stats.total_partner_sessions_within_range, 0) AS total_partner_sessions_within_range,
 *     COALESCE(sessions_stats.total_partner_time_tutored, 0) AS total_partner_time_tutored,
 *     COALESCE(sessions_stats.total_partner_time_tutored_within_range, 0) AS total_partner_time_tutored_within_range,
 *     COALESCE(notifications_stats.total, 0) AS total_notifications,
 *     COALESCE(notifications_stats.total_within_range, 0) AS total_notifications_within_range
 * FROM
 *     users
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_profiles.volunteer_partner_org_id = volunteer_partner_orgs.id
 *     LEFT JOIN (
 *         SELECT
 *             COUNT(*)::int AS total,
 *             user_id
 *         FROM
 *             users_quizzes
 *         WHERE
 *             passed = TRUE
 *         GROUP BY
 *             user_id) AS users_quizzes ON users_quizzes.user_id = volunteer_profiles.user_id
 *     LEFT JOIN (
 *         SELECT
 *             MAX(updated_at) AS updated_at,
 *             user_id
 *         FROM
 *             availabilities
 *         GROUP BY
 *             user_id) AS availabilities ON availabilities.user_id = users.id
 *     LEFT JOIN (
 *         SELECT
 *             created_at,
 *             user_id
 *         FROM
 *             user_actions
 *         WHERE
 *             action = 'ONBOARDED') AS user_actions ON user_actions.user_id = volunteer_profiles.user_id
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             COUNT(*)::int AS total_sessions,
 *             COUNT(DISTINCT student_id)::int AS total_unique_students_helped,
 *             COUNT(DISTINCT CASE WHEN sessions.created_at >= :start!
 *                     AND sessions.created_at <= :end! THEN
 *                     student_id
 *                 ELSE
 *                     NULL
 *                 END)::int AS total_unique_students_helped_within_range,
 *             COUNT(DISTINCT CASE WHEN student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)
 *                     OR student_profiles.school_id = ANY (:studentSchoolIds!) THEN
 *                     sessions.student_id
 *                 ELSE
 *                     NULL
 *                 END)::int AS total_unique_partner_students_helped,
 *             COUNT(DISTINCT CASE WHEN sessions.created_at >= :start!
 *                     AND sessions.created_at <= :end!
 *                     AND (student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)
 *                         OR student_profiles.school_id = ANY (:studentSchoolIds!)) THEN
 *                     sessions.student_id
 *                 ELSE
 *                     NULL
 *                 END)::int AS total_unique_partner_students_helped_within_range,
 *             SUM(
 *                 CASE WHEN sessions.created_at >= :start!
 *                     AND sessions.created_at <= :end! THEN
 *                     1
 *                 ELSE
 *                     0
 *                 END)::int AS total_sessions_within_range,
 *             SUM(
 *                 CASE WHEN student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)
 *                     OR student_profiles.school_id = ANY (:studentSchoolIds!) THEN
 *                     1
 *                 ELSE
 *                     0
 *                 END)::int AS total_partner_sessions,
 *             SUM(
 *                 CASE WHEN sessions.created_at >= :start!
 *                     AND sessions.created_at <= :end!
 *                     AND (student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)
 *                         OR student_profiles.school_id = ANY (:studentSchoolIds!)) THEN
 *                     1
 *                 ELSE
 *                     0
 *                 END)::int AS total_partner_sessions_within_range,
 *             SUM(
 *                 CASE WHEN student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)
 *                     OR student_profiles.school_id = ANY (:studentSchoolIds!) THEN
 *                     sessions.time_tutored
 *                 ELSE
 *                     0
 *                 END)::bigint AS total_partner_time_tutored,
 *             SUM(
 *                 CASE WHEN sessions.created_at >= :start!
 *                     AND sessions.created_at <= :end!
 *                     AND (student_profiles.student_partner_org_id = ANY (:studentPartnerOrgIds!)
 *                         OR student_profiles.school_id = ANY (:studentSchoolIds!)) THEN
 *                     sessions.time_tutored
 *                 ELSE
 *                     0
 *                 END)::bigint AS total_partner_time_tutored_within_range
 *         FROM
 *             sessions
 *     LEFT JOIN student_profiles ON sessions.student_id = student_profiles.user_id
 * WHERE
 *     volunteer_profiles.user_id = sessions.volunteer_id) AS sessions_stats ON TRUE
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             COUNT(*)::int AS total,
 *             SUM(
 *                 CASE WHEN sent_at >= :start!
 *                     AND sent_at <= :end! THEN
 *                     1
 *                 ELSE
 *                     0
 *                 END)::int AS total_within_range
 *         FROM
 *             notifications
 *     WHERE
 *         volunteer_profiles.user_id = notifications.user_id) AS notifications_stats ON TRUE
 * WHERE
 *     volunteer_partner_orgs.key = :volunteerPartnerOrg!
 *     AND (:cursor::uuid IS NULL
 *         OR users.id <= :cursor::uuid)
 * ORDER BY
 *     users.id DESC
 * LIMIT (:pageSize!::int)
 * ```
 */
exports.getVolunteersForAnalyticsReport = new query_1.PreparedQuery(getVolunteersForAnalyticsReportIR);
const removeOnboardedStatusForUnqualifiedVolunteersIR = { "name": "removeOnboardedStatusForUnqualifiedVolunteers", "params": [], "usedParamSet": {}, "statement": { "body": "UPDATE\n    volunteer_profiles\nSET\n    onboarded = FALSE,\n    updated_at = NOW()\nFROM (\n    SELECT\n        users_training_courses.complete AS training_course_complete,\n        users_training_courses.user_id,\n        users_quizzes.passed AS training_quiz_passed\n    FROM\n        users_training_courses\n    LEFT JOIN (\n        SELECT\n            users_quizzes.passed,\n            users_quizzes.user_id,\n            quizzes.name\n        FROM\n            users_quizzes\n            LEFT JOIN quizzes ON users_quizzes.quiz_id = quizzes.id) AS users_quizzes ON users_quizzes.user_id = users_training_courses.user_id\n            AND users_quizzes.name = 'upchieve101') AS subquery\nWHERE\n    volunteer_profiles.onboarded IS TRUE\n    AND volunteer_profiles.created_at >= '2022-01-01 00:00:00.000000+00'\n    AND subquery.training_course_complete IS TRUE\n    AND (subquery.training_quiz_passed IS FALSE\n        OR subquery.training_quiz_passed IS NULL)\nAND volunteer_profiles.user_id = subquery.user_id\nRETURNING\n    volunteer_profiles.user_id AS ok", "loc": { "a": 47832, "b": 48867, "line": 1568, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     volunteer_profiles
 * SET
 *     onboarded = FALSE,
 *     updated_at = NOW()
 * FROM (
 *     SELECT
 *         users_training_courses.complete AS training_course_complete,
 *         users_training_courses.user_id,
 *         users_quizzes.passed AS training_quiz_passed
 *     FROM
 *         users_training_courses
 *     LEFT JOIN (
 *         SELECT
 *             users_quizzes.passed,
 *             users_quizzes.user_id,
 *             quizzes.name
 *         FROM
 *             users_quizzes
 *             LEFT JOIN quizzes ON users_quizzes.quiz_id = quizzes.id) AS users_quizzes ON users_quizzes.user_id = users_training_courses.user_id
 *             AND users_quizzes.name = 'upchieve101') AS subquery
 * WHERE
 *     volunteer_profiles.onboarded IS TRUE
 *     AND volunteer_profiles.created_at >= '2022-01-01 00:00:00.000000+00'
 *     AND subquery.training_course_complete IS TRUE
 *     AND (subquery.training_quiz_passed IS FALSE
 *         OR subquery.training_quiz_passed IS NULL)
 * AND volunteer_profiles.user_id = subquery.user_id
 * RETURNING
 *     volunteer_profiles.user_id AS ok
 * ```
 */
exports.removeOnboardedStatusForUnqualifiedVolunteers = new query_1.PreparedQuery(removeOnboardedStatusForUnqualifiedVolunteersIR);
const getPartnerOrgsByVolunteerIR = { "name": "getPartnerOrgsByVolunteer", "params": [{ "name": "volunteerId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 49102, "b": 49113, "line": 1608, "col": 21 }] } }], "usedParamSet": { "volunteerId": true }, "statement": { "body": "SELECT\n    vpo.name,\n    vpo.id\nFROM\n    users_volunteer_partner_orgs_instances uvpoi\n    JOIN volunteer_partner_orgs vpo ON vpo.id = uvpoi.volunteer_partner_org_id\nWHERE\n    uvpoi.user_id = :volunteerId!\n    AND deactivated_on IS NULL", "loc": { "a": 48910, "b": 49144, "line": 1601, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     vpo.name,
 *     vpo.id
 * FROM
 *     users_volunteer_partner_orgs_instances uvpoi
 *     JOIN volunteer_partner_orgs vpo ON vpo.id = uvpoi.volunteer_partner_org_id
 * WHERE
 *     uvpoi.user_id = :volunteerId!
 *     AND deactivated_on IS NULL
 * ```
 */
exports.getPartnerOrgsByVolunteer = new query_1.PreparedQuery(getPartnerOrgsByVolunteerIR);
const adminDeactivateVolunteerPartnershipInstanceIR = { "name": "adminDeactivateVolunteerPartnershipInstance", "params": [{ "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 49307, "b": 49313, "line": 1618, "col": 15 }] } }, { "name": "vpoId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 49351, "b": 49356, "line": 1619, "col": 36 }] } }], "usedParamSet": { "userId": true, "vpoId": true }, "statement": { "body": "UPDATE\n    users_volunteer_partner_orgs_instances\nSET\n    deactivated_on = NOW()\nWHERE\n    user_id = :userId!\n    AND volunteer_partner_org_id = :vpoId!\nRETURNING\n    user_id AS ok", "loc": { "a": 49205, "b": 49384, "line": 1613, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     users_volunteer_partner_orgs_instances
 * SET
 *     deactivated_on = NOW()
 * WHERE
 *     user_id = :userId!
 *     AND volunteer_partner_org_id = :vpoId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
exports.adminDeactivateVolunteerPartnershipInstance = new query_1.PreparedQuery(adminDeactivateVolunteerPartnershipInstanceIR);
const adminInsertVolunteerPartnershipInstanceIR = { "name": "adminInsertVolunteerPartnershipInstance", "params": [{ "name": "userId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 49565, "b": 49571, "line": 1626, "col": 13 }] } }, { "name": "partnerOrgId", "required": true, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 49575, "b": 49587, "line": 1626, "col": 23 }] } }], "usedParamSet": { "userId": true, "partnerOrgId": true }, "statement": { "body": "INSERT INTO users_volunteer_partner_orgs_instances (user_id, volunteer_partner_org_id, created_at, updated_at)\n    VALUES (:userId!, :partnerOrgId!, NOW(), NOW())\nRETURNING\n    user_id AS ok", "loc": { "a": 49441, "b": 49630, "line": 1625, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_volunteer_partner_orgs_instances (user_id, volunteer_partner_org_id, created_at, updated_at)
 *     VALUES (:userId!, :partnerOrgId!, NOW(), NOW())
 * RETURNING
 *     user_id AS ok
 * ```
 */
exports.adminInsertVolunteerPartnershipInstance = new query_1.PreparedQuery(adminInsertVolunteerPartnershipInstanceIR);
const getPartnerOrgByKeyIR = { "name": "getPartnerOrgByKey", "params": [{ "name": "partnerOrgKey", "required": false, "transform": { "type": "scalar" }, "codeRefs": { "used": [{ "a": 49885, "b": 49897, "line": 1639, "col": 34 }] } }], "usedParamSet": { "partnerOrgKey": true }, "statement": { "body": "SELECT\n    volunteer_partner_orgs.id AS partner_id,\n    volunteer_partner_orgs.key AS partner_key,\n    volunteer_partner_orgs.name AS partner_name\nFROM\n    volunteer_partner_orgs\nWHERE\n    volunteer_partner_orgs.key = :partnerOrgKey\nLIMIT 1", "loc": { "a": 49666, "b": 49905, "line": 1632, "col": 0 } } };
/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     volunteer_partner_orgs.id AS partner_id,
 *     volunteer_partner_orgs.key AS partner_key,
 *     volunteer_partner_orgs.name AS partner_name
 * FROM
 *     volunteer_partner_orgs
 * WHERE
 *     volunteer_partner_orgs.key = :partnerOrgKey
 * LIMIT 1
 * ```
 */
exports.getPartnerOrgByKey = new query_1.PreparedQuery(getPartnerOrgByKeyIR);

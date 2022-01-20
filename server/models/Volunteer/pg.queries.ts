/** Types generated for queries found in "server/models/Volunteer/volunteer.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetSubjectsForVolunteer' parameters type */
export interface IGetSubjectsForVolunteerParams {
  userId: string;
}

/** 'GetSubjectsForVolunteer' return type */
export interface IGetSubjectsForVolunteerResult {
  subject: string;
}

/** 'GetSubjectsForVolunteer' query type */
export interface IGetSubjectsForVolunteerQuery {
  params: IGetSubjectsForVolunteerParams;
  result: IGetSubjectsForVolunteerResult;
}

const getSubjectsForVolunteerIR: any = {"name":"getSubjectsForVolunteer","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":748,"b":754,"line":26,"col":20}]}}],"usedParamSet":{"userId":true},"statement":{"body":"WITH CTE AS (\n    SELECT\n        subjects.name,\n        COUNT(*)::int AS total\n    FROM\n        certification_subject_unlocks\n        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n    GROUP BY\n        subjects.name\n)\nSELECT\n    subjects_unlocked.subject\nFROM (\n    SELECT\n        subjects.name AS subject,\n        COUNT(*)::int AS earned_certs,\n        CTE.total\n    FROM\n        users_certifications\n        JOIN certification_subject_unlocks USING (certification_id)\n        JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n        JOIN users ON users.id = users_certifications.user_id\n        JOIN CTE ON CTE.name = subjects.name\n    WHERE\n        users.id = :userId!\n    GROUP BY\n        subjects.name, CTE.total\n    HAVING\n        COUNT(*)::int >= CTE.total) AS subjects_unlocked","loc":{"a":36,"b":868,"line":2,"col":0}}};

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
 *     subjects_unlocked.subject
 * FROM (
 *     SELECT
 *         subjects.name AS subject,
 *         COUNT(*)::int AS earned_certs,
 *         CTE.total
 *     FROM
 *         users_certifications
 *         JOIN certification_subject_unlocks USING (certification_id)
 *         JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
 *         JOIN users ON users.id = users_certifications.user_id
 *         JOIN CTE ON CTE.name = subjects.name
 *     WHERE
 *         users.id = :userId!
 *     GROUP BY
 *         subjects.name, CTE.total
 *     HAVING
 *         COUNT(*)::int >= CTE.total) AS subjects_unlocked
 * ```
 */
export const getSubjectsForVolunteer = new PreparedQuery<IGetSubjectsForVolunteerParams,IGetSubjectsForVolunteerResult>(getSubjectsForVolunteerIR);


/** 'GetNextOpenVolunteerToNotify' parameters type */
export interface IGetNextOpenVolunteerToNotifyParams {
  lastNotified: Date;
  subject: string;
}

/** 'GetNextOpenVolunteerToNotify' return type */
export interface IGetNextOpenVolunteerToNotifyResult {
  email: string;
  firstName: string;
  volunteerPartnerOrg: string;
}

/** 'GetNextOpenVolunteerToNotify' query type */
export interface IGetNextOpenVolunteerToNotifyQuery {
  params: IGetNextOpenVolunteerToNotifyParams;
  result: IGetNextOpenVolunteerToNotifyResult;
}

const getNextOpenVolunteerToNotifyIR: any = {"name":"getNextOpenVolunteerToNotify","params":[{"name":"subject","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3046,"b":3053,"line":80,"col":37}]}},{"name":"lastNotified","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3228,"b":3240,"line":88,"col":33}]}}],"usedParamSet":{"subject":true,"lastNotified":true},"statement":{"body":"SELECT\n    email,\n    first_name,\n    volunteer_partner_orgs.name AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    JOIN availabilities ON users.id = availabilities.user_id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    JOIN (\n        SELECT\n            sub_unlocked.user_id,\n            subjects.name AS subject\n        FROM (\n            SELECT\n                users.id AS user_id,\n                subjects.name AS subject,\n                COUNT(*)::int AS earned_certs,\n                subject_total.total\n            FROM\n                users_certifications\n                JOIN certification_subject_unlocks USING (certification_id)\n                JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n                JOIN users ON users.id = users_certifications.user_id\n                JOIN (\n                    SELECT\n                        subjects.name, COUNT(*)::int AS total\n                    FROM\n                        certification_subject_unlocks\n                        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n                    GROUP BY\n                        subjects.name) AS subject_total ON subject_total.name = subjects.name\n                GROUP BY\n                    users.id,\n                    subjects.name,\n                    subject_total.total\n                HAVING\n                    COUNT(*)::int >= subject_total.total) AS sub_unlocked\n                JOIN subjects ON sub_unlocked.subject = subjects.name) AS subjects_unlocked ON subjects_unlocked.user_id = users.id\nWHERE\n    test_user IS FALSE\n    AND banned IS FALSE\n    AND deactivated IS FALSE\n    AND extract(isodow FROM (now() at time zone availabilities.timezone)) = availabilities.weekday_id\n    AND extract(hour FROM (now() at time zone availabilities.timezone)) >= availabilities.available_start\n    AND extract(hour FROM (now() at time zone availabilities.timezone)) + 1 < availabilities.available_end\n    AND subjects_unlocked.subject = :subject!\n    AND NOT EXISTS (\n        SELECT\n            user_id\n        FROM\n            notifications\n        WHERE\n            user_id = users.id\n            AND sent_at >= DATE(:lastNotified!))\nLIMIT 1","loc":{"a":914,"b":3250,"line":34,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     email,
 *     first_name,
 *     volunteer_partner_orgs.name AS volunteer_partner_org
 * FROM
 *     users
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     JOIN availabilities ON users.id = availabilities.user_id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 *     JOIN (
 *         SELECT
 *             sub_unlocked.user_id,
 *             subjects.name AS subject
 *         FROM (
 *             SELECT
 *                 users.id AS user_id,
 *                 subjects.name AS subject,
 *                 COUNT(*)::int AS earned_certs,
 *                 subject_total.total
 *             FROM
 *                 users_certifications
 *                 JOIN certification_subject_unlocks USING (certification_id)
 *                 JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
 *                 JOIN users ON users.id = users_certifications.user_id
 *                 JOIN (
 *                     SELECT
 *                         subjects.name, COUNT(*)::int AS total
 *                     FROM
 *                         certification_subject_unlocks
 *                         JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
 *                     GROUP BY
 *                         subjects.name) AS subject_total ON subject_total.name = subjects.name
 *                 GROUP BY
 *                     users.id,
 *                     subjects.name,
 *                     subject_total.total
 *                 HAVING
 *                     COUNT(*)::int >= subject_total.total) AS sub_unlocked
 *                 JOIN subjects ON sub_unlocked.subject = subjects.name) AS subjects_unlocked ON subjects_unlocked.user_id = users.id
 * WHERE
 *     test_user IS FALSE
 *     AND banned IS FALSE
 *     AND deactivated IS FALSE
 *     AND extract(isodow FROM (now() at time zone availabilities.timezone)) = availabilities.weekday_id
 *     AND extract(hour FROM (now() at time zone availabilities.timezone)) >= availabilities.available_start
 *     AND extract(hour FROM (now() at time zone availabilities.timezone)) + 1 < availabilities.available_end
 *     AND subjects_unlocked.subject = :subject!
 *     AND NOT EXISTS (
 *         SELECT
 *             user_id
 *         FROM
 *             notifications
 *         WHERE
 *             user_id = users.id
 *             AND sent_at >= DATE(:lastNotified!))
 * LIMIT 1
 * ```
 */
export const getNextOpenVolunteerToNotify = new PreparedQuery<IGetNextOpenVolunteerToNotifyParams,IGetNextOpenVolunteerToNotifyResult>(getNextOpenVolunteerToNotifyIR);


/** 'GetNextAnyPartnerVolunteerToNotify' parameters type */
export interface IGetNextAnyPartnerVolunteerToNotifyParams {
  lastNotified: Date;
  subject: string;
}

/** 'GetNextAnyPartnerVolunteerToNotify' return type */
export interface IGetNextAnyPartnerVolunteerToNotifyResult {
  email: string;
  firstName: string;
  volunteerPartnerOrg: string;
}

/** 'GetNextAnyPartnerVolunteerToNotify' query type */
export interface IGetNextAnyPartnerVolunteerToNotifyQuery {
  params: IGetNextAnyPartnerVolunteerToNotifyParams;
  result: IGetNextAnyPartnerVolunteerToNotifyResult;
}

const getNextAnyPartnerVolunteerToNotifyIR: any = {"name":"getNextAnyPartnerVolunteerToNotify","params":[{"name":"subject","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5429,"b":5436,"line":139,"col":37}]}},{"name":"lastNotified","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5611,"b":5623,"line":147,"col":33}]}}],"usedParamSet":{"subject":true,"lastNotified":true},"statement":{"body":"SELECT\n    email,\n    first_name,\n    volunteer_partner_orgs.name AS volunteer_partner_org\nFROM\n    users\n    JOIN availabilities ON users.id = availabilities.user_id\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    JOIN (\n        SELECT\n            sub_unlocked.user_id,\n            subjects.name AS subject\n        FROM (\n            SELECT\n                users.id AS user_id,\n                subjects.name AS subject,\n                COUNT(*)::int AS earned_certs,\n                subject_total.total\n            FROM\n                users_certifications\n                JOIN certification_subject_unlocks USING (certification_id)\n                JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n                JOIN users ON users.id = users_certifications.user_id\n                JOIN (\n                    SELECT\n                        subjects.name, COUNT(*)::int AS total\n                    FROM\n                        certification_subject_unlocks\n                        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n                    GROUP BY\n                        subjects.name) AS subject_total ON subject_total.name = subjects.name\n                GROUP BY\n                    users.id,\n                    subjects.name,\n                    subject_total.total\n                HAVING\n                    COUNT(*)::int >= subject_total.total) AS sub_unlocked\n                JOIN subjects ON sub_unlocked.subject = subjects.name) AS subjects_unlocked ON subjects_unlocked.user_id = users.id\nWHERE\n    test_user IS FALSE\n    AND banned IS FALSE\n    AND deactivated IS FALSE\n    AND extract(isodow FROM (now() at time zone availabilities.timezone)) = availabilities.weekday_id\n    AND extract(hour FROM (now() at time zone availabilities.timezone)) >= availabilities.available_start\n    AND extract(hour FROM (now() at time zone availabilities.timezone)) + 1 < availabilities.available_end\n    AND subjects_unlocked.subject = :subject!\n    AND NOT EXISTS (\n        SELECT\n            user_id\n        FROM\n            notifications\n        WHERE\n            user_id = users.id\n            AND sent_at >= DATE(:lastNotified!))\nLIMIT 1","loc":{"a":3302,"b":5633,"line":93,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     email,
 *     first_name,
 *     volunteer_partner_orgs.name AS volunteer_partner_org
 * FROM
 *     users
 *     JOIN availabilities ON users.id = availabilities.user_id
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 *     JOIN (
 *         SELECT
 *             sub_unlocked.user_id,
 *             subjects.name AS subject
 *         FROM (
 *             SELECT
 *                 users.id AS user_id,
 *                 subjects.name AS subject,
 *                 COUNT(*)::int AS earned_certs,
 *                 subject_total.total
 *             FROM
 *                 users_certifications
 *                 JOIN certification_subject_unlocks USING (certification_id)
 *                 JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
 *                 JOIN users ON users.id = users_certifications.user_id
 *                 JOIN (
 *                     SELECT
 *                         subjects.name, COUNT(*)::int AS total
 *                     FROM
 *                         certification_subject_unlocks
 *                         JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
 *                     GROUP BY
 *                         subjects.name) AS subject_total ON subject_total.name = subjects.name
 *                 GROUP BY
 *                     users.id,
 *                     subjects.name,
 *                     subject_total.total
 *                 HAVING
 *                     COUNT(*)::int >= subject_total.total) AS sub_unlocked
 *                 JOIN subjects ON sub_unlocked.subject = subjects.name) AS subjects_unlocked ON subjects_unlocked.user_id = users.id
 * WHERE
 *     test_user IS FALSE
 *     AND banned IS FALSE
 *     AND deactivated IS FALSE
 *     AND extract(isodow FROM (now() at time zone availabilities.timezone)) = availabilities.weekday_id
 *     AND extract(hour FROM (now() at time zone availabilities.timezone)) >= availabilities.available_start
 *     AND extract(hour FROM (now() at time zone availabilities.timezone)) + 1 < availabilities.available_end
 *     AND subjects_unlocked.subject = :subject!
 *     AND NOT EXISTS (
 *         SELECT
 *             user_id
 *         FROM
 *             notifications
 *         WHERE
 *             user_id = users.id
 *             AND sent_at >= DATE(:lastNotified!))
 * LIMIT 1
 * ```
 */
export const getNextAnyPartnerVolunteerToNotify = new PreparedQuery<IGetNextAnyPartnerVolunteerToNotifyParams,IGetNextAnyPartnerVolunteerToNotifyResult>(getNextAnyPartnerVolunteerToNotifyIR);


/** 'GetNextSpecificPartnerVolunteerToNotify' parameters type */
export interface IGetNextSpecificPartnerVolunteerToNotifyParams {
  lastNotified: Date;
  subject: string;
  volunteerPartnerOrg: string;
}

/** 'GetNextSpecificPartnerVolunteerToNotify' return type */
export interface IGetNextSpecificPartnerVolunteerToNotifyResult {
  email: string;
  firstName: string;
  volunteerPartnerOrg: string;
}

/** 'GetNextSpecificPartnerVolunteerToNotify' query type */
export interface IGetNextSpecificPartnerVolunteerToNotifyQuery {
  params: IGetNextSpecificPartnerVolunteerToNotifyParams;
  result: IGetNextSpecificPartnerVolunteerToNotifyResult;
}

const getNextSpecificPartnerVolunteerToNotifyIR: any = {"name":"getNextSpecificPartnerVolunteerToNotify","params":[{"name":"subject","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7817,"b":7824,"line":198,"col":37}]}},{"name":"volunteerPartnerOrg","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7865,"b":7884,"line":199,"col":39}]}},{"name":"lastNotified","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8059,"b":8071,"line":207,"col":33}]}}],"usedParamSet":{"subject":true,"volunteerPartnerOrg":true,"lastNotified":true},"statement":{"body":"SELECT\n    email,\n    first_name,\n    volunteer_partner_orgs.name AS volunteer_partner_org\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    JOIN availabilities ON users.id = availabilities.user_id\n    JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id\n    JOIN (\n        SELECT\n            sub_unlocked.user_id,\n            subjects.name AS subject\n        FROM (\n            SELECT\n                users.id AS user_id,\n                subjects.name AS subject,\n                COUNT(*)::int AS earned_certs,\n                subject_total.total\n            FROM\n                users_certifications\n                JOIN certification_subject_unlocks USING (certification_id)\n                JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n                JOIN users ON users.id = users_certifications.user_id\n                JOIN (\n                    SELECT\n                        subjects.name, COUNT(*)::int AS total\n                    FROM\n                        certification_subject_unlocks\n                        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n                    GROUP BY\n                        subjects.name) AS subject_total ON subject_total.name = subjects.name\n                GROUP BY\n                    users.id,\n                    subjects.name,\n                    subject_total.total\n                HAVING\n                    COUNT(*)::int >= subject_total.total) AS sub_unlocked\n                JOIN subjects ON sub_unlocked.subject = subjects.name) AS subjects_unlocked ON subjects_unlocked.user_id = users.id\nWHERE\n    test_user IS FALSE\n    AND banned IS FALSE\n    AND deactivated IS FALSE\n    AND extract(isodow FROM (now() at time zone availabilities.timezone)) = availabilities.weekday_id\n    AND extract(hour FROM (now() at time zone availabilities.timezone)) >= availabilities.available_start\n    AND extract(hour FROM (now() at time zone availabilities.timezone)) + 1 < availabilities.available_end\n    AND subjects_unlocked.subject = :subject!\n    AND volunteer_partner_orgs.name = :volunteerPartnerOrg!\n    AND NOT EXISTS (\n        SELECT\n            user_id\n        FROM\n            notifications\n        WHERE\n            user_id = users.id\n            AND sent_at >= DATE(:lastNotified!))\nLIMIT 1","loc":{"a":5690,"b":8081,"line":152,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     email,
 *     first_name,
 *     volunteer_partner_orgs.name AS volunteer_partner_org
 * FROM
 *     users
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     JOIN availabilities ON users.id = availabilities.user_id
 *     JOIN volunteer_partner_orgs ON volunteer_partner_orgs.id = volunteer_profiles.volunteer_partner_org_id
 *     JOIN (
 *         SELECT
 *             sub_unlocked.user_id,
 *             subjects.name AS subject
 *         FROM (
 *             SELECT
 *                 users.id AS user_id,
 *                 subjects.name AS subject,
 *                 COUNT(*)::int AS earned_certs,
 *                 subject_total.total
 *             FROM
 *                 users_certifications
 *                 JOIN certification_subject_unlocks USING (certification_id)
 *                 JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
 *                 JOIN users ON users.id = users_certifications.user_id
 *                 JOIN (
 *                     SELECT
 *                         subjects.name, COUNT(*)::int AS total
 *                     FROM
 *                         certification_subject_unlocks
 *                         JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
 *                     GROUP BY
 *                         subjects.name) AS subject_total ON subject_total.name = subjects.name
 *                 GROUP BY
 *                     users.id,
 *                     subjects.name,
 *                     subject_total.total
 *                 HAVING
 *                     COUNT(*)::int >= subject_total.total) AS sub_unlocked
 *                 JOIN subjects ON sub_unlocked.subject = subjects.name) AS subjects_unlocked ON subjects_unlocked.user_id = users.id
 * WHERE
 *     test_user IS FALSE
 *     AND banned IS FALSE
 *     AND deactivated IS FALSE
 *     AND extract(isodow FROM (now() at time zone availabilities.timezone)) = availabilities.weekday_id
 *     AND extract(hour FROM (now() at time zone availabilities.timezone)) >= availabilities.available_start
 *     AND extract(hour FROM (now() at time zone availabilities.timezone)) + 1 < availabilities.available_end
 *     AND subjects_unlocked.subject = :subject!
 *     AND volunteer_partner_orgs.name = :volunteerPartnerOrg!
 *     AND NOT EXISTS (
 *         SELECT
 *             user_id
 *         FROM
 *             notifications
 *         WHERE
 *             user_id = users.id
 *             AND sent_at >= DATE(:lastNotified!))
 * LIMIT 1
 * ```
 */
export const getNextSpecificPartnerVolunteerToNotify = new PreparedQuery<IGetNextSpecificPartnerVolunteerToNotifyParams,IGetNextSpecificPartnerVolunteerToNotifyResult>(getNextSpecificPartnerVolunteerToNotifyIR);



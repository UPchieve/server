/** Types generated for queries found in "server/models/Availability/availability.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'GetAvailabilityForVolunteer' parameters type */
export interface IGetAvailabilityForVolunteerParams {
  mongoUserId: string | null | void;
  userId: string | null | void;
}

/** 'GetAvailabilityForVolunteer' return type */
export interface IGetAvailabilityForVolunteerResult {
  availableEnd: number;
  availableStart: number;
  id: string;
  timezone: string;
  weekday: string;
}

/** 'GetAvailabilityForVolunteer' query type */
export interface IGetAvailabilityForVolunteerQuery {
  params: IGetAvailabilityForVolunteerParams;
  result: IGetAvailabilityForVolunteerResult;
}

const getAvailabilityForVolunteerIR: any = {"name":"getAvailabilityForVolunteer","params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":386,"b":391,"line":13,"col":36}]}},{"name":"mongoUserId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":424,"b":434,"line":14,"col":31}]}}],"usedParamSet":{"userId":true,"mongoUserId":true},"statement":{"body":"SELECT\n    availabilities.id,\n    availabilities.available_start,\n    availabilities.available_end,\n    availabilities.timezone,\n    weekdays.day AS weekday\nFROM\n    availabilities\n    LEFT JOIN weekdays ON availabilities.weekday_id = weekdays.id\n    LEFT JOIN users ON availabilities.user_id = users.id\nWHERE\n    availabilities.user_id::uuid = :userId\n    OR users.mongo_id::text = :mongoUserId","loc":{"a":40,"b":434,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     availabilities.id,
 *     availabilities.available_start,
 *     availabilities.available_end,
 *     availabilities.timezone,
 *     weekdays.day AS weekday
 * FROM
 *     availabilities
 *     LEFT JOIN weekdays ON availabilities.weekday_id = weekdays.id
 *     LEFT JOIN users ON availabilities.user_id = users.id
 * WHERE
 *     availabilities.user_id::uuid = :userId
 *     OR users.mongo_id::text = :mongoUserId
 * ```
 */
export const getAvailabilityForVolunteer = new PreparedQuery<IGetAvailabilityForVolunteerParams,IGetAvailabilityForVolunteerResult>(getAvailabilityForVolunteerIR);


/** 'GetAvailabilityForVolunteerHeatmap' parameters type */
export interface IGetAvailabilityForVolunteerHeatmapParams {
  subject: string;
}

/** 'GetAvailabilityForVolunteerHeatmap' return type */
export interface IGetAvailabilityForVolunteerHeatmapResult {
  availableEnd: number;
  availableStart: number;
  id: string;
  timezone: string;
  userId: string;
  weekday: string;
}

/** 'GetAvailabilityForVolunteerHeatmap' query type */
export interface IGetAvailabilityForVolunteerHeatmapQuery {
  params: IGetAvailabilityForVolunteerHeatmapParams;
  result: IGetAvailabilityForVolunteerHeatmapResult;
}

const getAvailabilityForVolunteerHeatmapIR: any = {"name":"getAvailabilityForVolunteerHeatmap","params":[{"name":"subject","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":721,"b":728,"line":27,"col":25},{"a":959,"b":966,"line":36,"col":25},{"a":1806,"b":1813,"line":61,"col":29},{"a":2406,"b":2413,"line":75,"col":29}]}}],"usedParamSet":{"subject":true},"statement":{"body":"WITH certs_for_subject AS (\n    SELECT\n        COUNT(*)::int AS total\n    FROM\n        certification_subject_unlocks\n        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n    WHERE\n        subjects.name = :subject!\n),\ncerts_for_computed_subject AS (\n    SELECT\n        COUNT(*)::int AS total\n    FROM\n        computed_subject_unlocks\n        JOIN subjects ON subjects.id = computed_subject_unlocks.subject_id\n    WHERE\n        subjects.name = :subject!\n)\nSELECT\n    availabilities.id,\n    availabilities.available_start,\n    availabilities.available_end,\n    availabilities.timezone,\n    availabilities.user_id,\n    weekdays.day AS weekday\nFROM\n    availabilities\n    LEFT JOIN weekdays ON availabilities.weekday_id = weekdays.id\n    JOIN users ON users.id = availabilities.user_id\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN (\n        SELECT\n            users_certifications.user_id,\n            COUNT(*)::int AS earned_certs,\n            certs_for_subject.total\n        FROM\n            users_certifications\n            JOIN certification_subject_unlocks USING (certification_id)\n            JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n            JOIN certs_for_subject ON TRUE\n        WHERE\n            subjects.name = :subject!\n        GROUP BY\n            users_certifications.user_id, subjects.name, certs_for_subject.total) user_certs ON user_certs.user_id = users.id\n    LEFT JOIN (\n        SELECT\n            users_certifications.user_id,\n            COUNT(*)::int AS earned_certs,\n            certs_for_computed_subject.total\n        FROM\n            users_certifications\n            JOIN computed_subject_unlocks USING (certification_id)\n            JOIN subjects ON computed_subject_unlocks.subject_id = subjects.id\n            JOIN certs_for_computed_subject ON TRUE\n        WHERE\n            subjects.name = :subject!\n        GROUP BY\n            users_certifications.user_id, subjects.name, certs_for_computed_subject.total\n        HAVING\n            COUNT(*)::int >= certs_for_computed_subject.total) user_computed_subjects ON user_computed_subjects.user_id = users.id\nWHERE\n    users.test_user IS FALSE\n    AND volunteer_profiles.onboarded IS TRUE\n    AND users.deactivated IS FALSE\n    AND users.banned IS FALSE\n    AND (user_certs.total IS NOT NULL\n        OR user_computed_subjects.total IS NOT NULL)","loc":{"a":489,"b":2902,"line":20,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH certs_for_subject AS (
 *     SELECT
 *         COUNT(*)::int AS total
 *     FROM
 *         certification_subject_unlocks
 *         JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id
 *     WHERE
 *         subjects.name = :subject!
 * ),
 * certs_for_computed_subject AS (
 *     SELECT
 *         COUNT(*)::int AS total
 *     FROM
 *         computed_subject_unlocks
 *         JOIN subjects ON subjects.id = computed_subject_unlocks.subject_id
 *     WHERE
 *         subjects.name = :subject!
 * )
 * SELECT
 *     availabilities.id,
 *     availabilities.available_start,
 *     availabilities.available_end,
 *     availabilities.timezone,
 *     availabilities.user_id,
 *     weekdays.day AS weekday
 * FROM
 *     availabilities
 *     LEFT JOIN weekdays ON availabilities.weekday_id = weekdays.id
 *     JOIN users ON users.id = availabilities.user_id
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN (
 *         SELECT
 *             users_certifications.user_id,
 *             COUNT(*)::int AS earned_certs,
 *             certs_for_subject.total
 *         FROM
 *             users_certifications
 *             JOIN certification_subject_unlocks USING (certification_id)
 *             JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id
 *             JOIN certs_for_subject ON TRUE
 *         WHERE
 *             subjects.name = :subject!
 *         GROUP BY
 *             users_certifications.user_id, subjects.name, certs_for_subject.total) user_certs ON user_certs.user_id = users.id
 *     LEFT JOIN (
 *         SELECT
 *             users_certifications.user_id,
 *             COUNT(*)::int AS earned_certs,
 *             certs_for_computed_subject.total
 *         FROM
 *             users_certifications
 *             JOIN computed_subject_unlocks USING (certification_id)
 *             JOIN subjects ON computed_subject_unlocks.subject_id = subjects.id
 *             JOIN certs_for_computed_subject ON TRUE
 *         WHERE
 *             subjects.name = :subject!
 *         GROUP BY
 *             users_certifications.user_id, subjects.name, certs_for_computed_subject.total
 *         HAVING
 *             COUNT(*)::int >= certs_for_computed_subject.total) user_computed_subjects ON user_computed_subjects.user_id = users.id
 * WHERE
 *     users.test_user IS FALSE
 *     AND volunteer_profiles.onboarded IS TRUE
 *     AND users.deactivated IS FALSE
 *     AND users.banned IS FALSE
 *     AND (user_certs.total IS NOT NULL
 *         OR user_computed_subjects.total IS NOT NULL)
 * ```
 */
export const getAvailabilityForVolunteerHeatmap = new PreparedQuery<IGetAvailabilityForVolunteerHeatmapParams,IGetAvailabilityForVolunteerHeatmapResult>(getAvailabilityForVolunteerHeatmapIR);


/** 'GetAvailabilityHistoryForDatesByVolunteerId' parameters type */
export interface IGetAvailabilityHistoryForDatesByVolunteerIdParams {
  end: Date;
  start: Date;
  userId: string;
}

/** 'GetAvailabilityHistoryForDatesByVolunteerId' return type */
export interface IGetAvailabilityHistoryForDatesByVolunteerIdResult {
  availableEnd: number;
  availableStart: number;
  id: string;
  recordedAt: Date;
  timezone: string;
  weekday: string;
}

/** 'GetAvailabilityHistoryForDatesByVolunteerId' query type */
export interface IGetAvailabilityHistoryForDatesByVolunteerIdQuery {
  params: IGetAvailabilityHistoryForDatesByVolunteerIdParams;
  result: IGetAvailabilityHistoryForDatesByVolunteerIdResult;
}

const getAvailabilityHistoryForDatesByVolunteerIdIR: any = {"name":"getAvailabilityHistoryForDatesByVolunteerId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3319,"b":3325,"line":101,"col":15}]}},{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3351,"b":3356,"line":102,"col":24}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3382,"b":3385,"line":103,"col":24}]}}],"usedParamSet":{"userId":true,"start":true,"end":true},"statement":{"body":"SELECT\n    availability_histories.id,\n    availability_histories.recorded_at,\n    availability_histories.available_start,\n    availability_histories.available_end,\n    availability_histories.timezone,\n    weekdays.day AS weekday\nFROM\n    availability_histories\n    LEFT JOIN weekdays ON availability_histories.weekday_id = weekdays.id\nWHERE\n    user_id = :userId!\n    AND recorded_at >= :start!\n    AND recorded_at <= :end!\nORDER BY\n    recorded_at","loc":{"a":2963,"b":3410,"line":90,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     availability_histories.id,
 *     availability_histories.recorded_at,
 *     availability_histories.available_start,
 *     availability_histories.available_end,
 *     availability_histories.timezone,
 *     weekdays.day AS weekday
 * FROM
 *     availability_histories
 *     LEFT JOIN weekdays ON availability_histories.weekday_id = weekdays.id
 * WHERE
 *     user_id = :userId!
 *     AND recorded_at >= :start!
 *     AND recorded_at <= :end!
 * ORDER BY
 *     recorded_at
 * ```
 */
export const getAvailabilityHistoryForDatesByVolunteerId = new PreparedQuery<IGetAvailabilityHistoryForDatesByVolunteerIdParams,IGetAvailabilityHistoryForDatesByVolunteerIdResult>(getAvailabilityHistoryForDatesByVolunteerIdIR);


/** 'GetLegacyAvailabilityHistoryForDatesByVolunteerId' parameters type */
export interface IGetLegacyAvailabilityHistoryForDatesByVolunteerIdParams {
  end: Date;
  start: Date;
  userId: string;
}

/** 'GetLegacyAvailabilityHistoryForDatesByVolunteerId' return type */
export interface IGetLegacyAvailabilityHistoryForDatesByVolunteerIdResult {
  id: string;
  legacyAvailability: Json;
  recordedAt: Date;
  timezone: string | null;
}

/** 'GetLegacyAvailabilityHistoryForDatesByVolunteerId' query type */
export interface IGetLegacyAvailabilityHistoryForDatesByVolunteerIdQuery {
  params: IGetLegacyAvailabilityHistoryForDatesByVolunteerIdParams;
  result: IGetLegacyAvailabilityHistoryForDatesByVolunteerIdResult;
}

const getLegacyAvailabilityHistoryForDatesByVolunteerIdIR: any = {"name":"getLegacyAvailabilityHistoryForDatesByVolunteerId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3727,"b":3733,"line":117,"col":15}]}},{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3759,"b":3764,"line":118,"col":24}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3790,"b":3793,"line":119,"col":24}]}}],"usedParamSet":{"userId":true,"start":true,"end":true},"statement":{"body":"SELECT\n    legacy_availability_histories.id,\n    legacy_availability_histories.recorded_at,\n    legacy_availability_histories.legacy_availability,\n    legacy_availability_histories.timezone\nFROM\n    legacy_availability_histories\nWHERE\n    user_id = :userId!\n    AND recorded_at >= :start!\n    AND recorded_at <= :end!\nORDER BY\n    recorded_at","loc":{"a":3477,"b":3818,"line":109,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     legacy_availability_histories.id,
 *     legacy_availability_histories.recorded_at,
 *     legacy_availability_histories.legacy_availability,
 *     legacy_availability_histories.timezone
 * FROM
 *     legacy_availability_histories
 * WHERE
 *     user_id = :userId!
 *     AND recorded_at >= :start!
 *     AND recorded_at <= :end!
 * ORDER BY
 *     recorded_at
 * ```
 */
export const getLegacyAvailabilityHistoryForDatesByVolunteerId = new PreparedQuery<IGetLegacyAvailabilityHistoryForDatesByVolunteerIdParams,IGetLegacyAvailabilityHistoryForDatesByVolunteerIdResult>(getLegacyAvailabilityHistoryForDatesByVolunteerIdIR);


/** 'SaveCurrentAvailabilityAsHistory' parameters type */
export interface ISaveCurrentAvailabilityAsHistoryParams {
  userId: string;
}

/** 'SaveCurrentAvailabilityAsHistory' return type */
export interface ISaveCurrentAvailabilityAsHistoryResult {
  ok: string;
}

/** 'SaveCurrentAvailabilityAsHistory' query type */
export interface ISaveCurrentAvailabilityAsHistoryQuery {
  params: ISaveCurrentAvailabilityAsHistoryParams;
  result: ISaveCurrentAvailabilityAsHistoryResult;
}

const saveCurrentAvailabilityAsHistoryIR: any = {"name":"saveCurrentAvailabilityAsHistory","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4197,"b":4203,"line":139,"col":15}]}}],"usedParamSet":{"userId":true},"statement":{"body":"INSERT INTO availability_histories (id, recorded_at, user_id, available_start, available_end, timezone, weekday_id, created_at, updated_at)\nSELECT\n    generate_ulid (),\n    NOW(),\n    user_id,\n    available_start,\n    available_end,\n    timezone,\n    weekday_id,\n    NOW(),\n    NOW()\nFROM\n    availabilities\nWHERE\n    user_id = :userId!\nRETURNING\n    id AS ok","loc":{"a":3868,"b":4226,"line":125,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO availability_histories (id, recorded_at, user_id, available_start, available_end, timezone, weekday_id, created_at, updated_at)
 * SELECT
 *     generate_ulid (),
 *     NOW(),
 *     user_id,
 *     available_start,
 *     available_end,
 *     timezone,
 *     weekday_id,
 *     NOW(),
 *     NOW()
 * FROM
 *     availabilities
 * WHERE
 *     user_id = :userId!
 * RETURNING
 *     id AS ok
 * ```
 */
export const saveCurrentAvailabilityAsHistory = new PreparedQuery<ISaveCurrentAvailabilityAsHistoryParams,ISaveCurrentAvailabilityAsHistoryResult>(saveCurrentAvailabilityAsHistoryIR);


/** 'SaveAvailabilityAsHistoryByDate' parameters type */
export interface ISaveAvailabilityAsHistoryByDateParams {
  recordedAt: Date;
  userId: string;
}

/** 'SaveAvailabilityAsHistoryByDate' return type */
export interface ISaveAvailabilityAsHistoryByDateResult {
  ok: string;
}

/** 'SaveAvailabilityAsHistoryByDate' query type */
export interface ISaveAvailabilityAsHistoryByDateQuery {
  params: ISaveAvailabilityAsHistoryByDateParams;
  result: ISaveAvailabilityAsHistoryByDateResult;
}

const saveAvailabilityAsHistoryByDateIR: any = {"name":"saveAvailabilityAsHistoryByDate","params":[{"name":"recordedAt","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4449,"b":4459,"line":148,"col":5},{"a":4758,"b":4768,"line":165,"col":28}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4797,"b":4803,"line":166,"col":27}]}}],"usedParamSet":{"recordedAt":true,"userId":true},"statement":{"body":"INSERT INTO availability_histories (id, recorded_at, user_id, available_start, available_end, timezone, weekday_id, created_at, updated_at)\nSELECT\n    generate_ulid (),\n    :recordedAt!,\n    user_id,\n    available_start,\n    available_end,\n    timezone,\n    weekday_id,\n    NOW(),\n    NOW()\nFROM\n    availability_histories\nWHERE\n    recorded_at = (\n        SELECT\n            MAX(recorded_at)\n        FROM\n            availability_histories\n        WHERE\n            recorded_at <= :recordedAt!\n            AND user_id = :userId!)\nRETURNING\n    id AS ok","loc":{"a":4275,"b":4827,"line":145,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO availability_histories (id, recorded_at, user_id, available_start, available_end, timezone, weekday_id, created_at, updated_at)
 * SELECT
 *     generate_ulid (),
 *     :recordedAt!,
 *     user_id,
 *     available_start,
 *     available_end,
 *     timezone,
 *     weekday_id,
 *     NOW(),
 *     NOW()
 * FROM
 *     availability_histories
 * WHERE
 *     recorded_at = (
 *         SELECT
 *             MAX(recorded_at)
 *         FROM
 *             availability_histories
 *         WHERE
 *             recorded_at <= :recordedAt!
 *             AND user_id = :userId!)
 * RETURNING
 *     id AS ok
 * ```
 */
export const saveAvailabilityAsHistoryByDate = new PreparedQuery<ISaveAvailabilityAsHistoryByDateParams,ISaveAvailabilityAsHistoryByDateResult>(saveAvailabilityAsHistoryByDateIR);


/** 'InsertNewAvailability' parameters type */
export interface IInsertNewAvailabilityParams {
  availableEnd: number;
  availableStart: number;
  day: string;
  id: string;
  timezone: string;
  userId: string;
}

/** 'InsertNewAvailability' return type */
export interface IInsertNewAvailabilityResult {
  ok: string;
}

/** 'InsertNewAvailability' query type */
export interface IInsertNewAvailabilityQuery {
  params: IInsertNewAvailabilityParams;
  result: IInsertNewAvailabilityResult;
}

const insertNewAvailabilityIR: any = {"name":"insertNewAvailability","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4997,"b":4999,"line":174,"col":5}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5007,"b":5013,"line":175,"col":5}]}},{"name":"availableStart","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5029,"b":5043,"line":177,"col":5}]}},{"name":"availableEnd","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5051,"b":5063,"line":178,"col":5}]}},{"name":"timezone","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5071,"b":5079,"line":179,"col":5}]}},{"name":"day","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5138,"b":5141,"line":185,"col":11}]}}],"usedParamSet":{"id":true,"userId":true,"availableStart":true,"availableEnd":true,"timezone":true,"day":true},"statement":{"body":"INSERT INTO availabilities (id, user_id, weekday_id, available_start, available_end, timezone, created_at, updated_at)\nSELECT\n    :id!,\n    :userId!,\n    id,\n    :availableStart!,\n    :availableEnd!,\n    :timezone!,\n    NOW(),\n    NOW()\nFROM\n    weekdays\nWHERE\n    day = :day!\nRETURNING\n    id AS ok","loc":{"a":4866,"b":5164,"line":172,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO availabilities (id, user_id, weekday_id, available_start, available_end, timezone, created_at, updated_at)
 * SELECT
 *     :id!,
 *     :userId!,
 *     id,
 *     :availableStart!,
 *     :availableEnd!,
 *     :timezone!,
 *     NOW(),
 *     NOW()
 * FROM
 *     weekdays
 * WHERE
 *     day = :day!
 * RETURNING
 *     id AS ok
 * ```
 */
export const insertNewAvailability = new PreparedQuery<IInsertNewAvailabilityParams,IInsertNewAvailabilityResult>(insertNewAvailabilityIR);


/** 'ClearAvailabilityForVolunteer' parameters type */
export interface IClearAvailabilityForVolunteerParams {
  userId: string;
}

/** 'ClearAvailabilityForVolunteer' return type */
export interface IClearAvailabilityForVolunteerResult {
  ok: string;
}

/** 'ClearAvailabilityForVolunteer' query type */
export interface IClearAvailabilityForVolunteerQuery {
  params: IClearAvailabilityForVolunteerParams;
  result: IClearAvailabilityForVolunteerResult;
}

const clearAvailabilityForVolunteerIR: any = {"name":"clearAvailabilityForVolunteer","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5255,"b":5261,"line":192,"col":17}]}}],"usedParamSet":{"userId":true},"statement":{"body":"DELETE FROM availabilities\nWHERE user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":5211,"b":5289,"line":191,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM availabilities
 * WHERE user_id = :userId!
 * RETURNING
 *     user_id AS ok
 * ```
 */
export const clearAvailabilityForVolunteer = new PreparedQuery<IClearAvailabilityForVolunteerParams,IClearAvailabilityForVolunteerResult>(clearAvailabilityForVolunteerIR);


/** 'SaveLegacyAvailability' parameters type */
export interface ISaveLegacyAvailabilityParams {
  availability: Json;
  id: string;
  userId: string;
}

/** 'SaveLegacyAvailability' return type */
export interface ISaveLegacyAvailabilityResult {
  ok: string;
}

/** 'SaveLegacyAvailability' query type */
export interface ISaveLegacyAvailabilityQuery {
  params: ISaveLegacyAvailabilityParams;
  result: ISaveLegacyAvailabilityResult;
}

const saveLegacyAvailabilityIR: any = {"name":"saveLegacyAvailability","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5465,"b":5467,"line":200,"col":5}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5475,"b":5481,"line":201,"col":5},{"a":5610,"b":5616,"line":210,"col":15}]}},{"name":"availability","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5529,"b":5541,"line":204,"col":5}]}}],"usedParamSet":{"id":true,"userId":true,"availability":true},"statement":{"body":"INSERT INTO legacy_availability_histories (id, user_id, timezone, recorded_at, legacy_availability, created_at, updated_at)\nSELECT\n    :id!,\n    :userId!,\n    availabilities.timezone,\n    NOW(),\n    :availability!,\n    NOW(),\n    NOW()\nFROM\n    availabilities\nWHERE\n    user_id = :userId!\nLIMIT 1\nRETURNING\n    id AS ok","loc":{"a":5329,"b":5647,"line":198,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO legacy_availability_histories (id, user_id, timezone, recorded_at, legacy_availability, created_at, updated_at)
 * SELECT
 *     :id!,
 *     :userId!,
 *     availabilities.timezone,
 *     NOW(),
 *     :availability!,
 *     NOW(),
 *     NOW()
 * FROM
 *     availabilities
 * WHERE
 *     user_id = :userId!
 * LIMIT 1
 * RETURNING
 *     id AS ok
 * ```
 */
export const saveLegacyAvailability = new PreparedQuery<ISaveLegacyAvailabilityParams,ISaveLegacyAvailabilityResult>(saveLegacyAvailabilityIR);


/** 'GetAvailabilityForVolunteerByDate' parameters type */
export interface IGetAvailabilityForVolunteerByDateParams {
  recordedAt: Date;
  userId: string;
}

/** 'GetAvailabilityForVolunteerByDate' return type */
export interface IGetAvailabilityForVolunteerByDateResult {
  availableEnd: number;
  availableStart: number;
  id: string;
  recordedAt: Date;
  timezone: string;
  weekday: string;
}

/** 'GetAvailabilityForVolunteerByDate' query type */
export interface IGetAvailabilityForVolunteerByDateQuery {
  params: IGetAvailabilityForVolunteerByDateParams;
  result: IGetAvailabilityForVolunteerByDateResult;
}

const getAvailabilityForVolunteerByDateIR: any = {"name":"getAvailabilityForVolunteerByDate","params":[{"name":"recordedAt","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6258,"b":6268,"line":235,"col":28}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6297,"b":6303,"line":236,"col":27},{"a":6325,"b":6331,"line":237,"col":19}]}}],"usedParamSet":{"recordedAt":true,"userId":true},"statement":{"body":"SELECT\n    availability_histories.id,\n    availability_histories.available_start,\n    availability_histories.available_end,\n    availability_histories.timezone,\n    availability_histories.recorded_at,\n    weekdays.day AS weekday\nFROM\n    availability_histories\n    LEFT JOIN weekdays ON availability_histories.weekday_id = weekdays.id\n    LEFT JOIN users ON availability_histories.user_id = users.id\nWHERE\n    recorded_at = (\n        SELECT\n            MAX(recorded_at)\n        FROM\n            availability_histories\n        WHERE\n            recorded_at <= :recordedAt!\n            AND user_id = :userId!)\n    AND user_id = :userId!","loc":{"a":5698,"b":6331,"line":217,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     availability_histories.id,
 *     availability_histories.available_start,
 *     availability_histories.available_end,
 *     availability_histories.timezone,
 *     availability_histories.recorded_at,
 *     weekdays.day AS weekday
 * FROM
 *     availability_histories
 *     LEFT JOIN weekdays ON availability_histories.weekday_id = weekdays.id
 *     LEFT JOIN users ON availability_histories.user_id = users.id
 * WHERE
 *     recorded_at = (
 *         SELECT
 *             MAX(recorded_at)
 *         FROM
 *             availability_histories
 *         WHERE
 *             recorded_at <= :recordedAt!
 *             AND user_id = :userId!)
 *     AND user_id = :userId!
 * ```
 */
export const getAvailabilityForVolunteerByDate = new PreparedQuery<IGetAvailabilityForVolunteerByDateParams,IGetAvailabilityForVolunteerByDateResult>(getAvailabilityForVolunteerByDateIR);



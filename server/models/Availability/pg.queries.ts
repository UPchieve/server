/** Types generated for queries found in "server/models/Availability/availability.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type DateOrString = Date | string;

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'GetAvailabilityForVolunteer' parameters type */
export interface IGetAvailabilityForVolunteerParams {
  userId?: string | null | void;
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

const getAvailabilityForVolunteerIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"locs":[{"a":345,"b":351}]}],"statement":"SELECT\n    availabilities.id,\n    availabilities.available_start,\n    availabilities.available_end,\n    availabilities.timezone,\n    weekdays.day AS weekday\nFROM\n    availabilities\n    LEFT JOIN weekdays ON availabilities.weekday_id = weekdays.id\n    LEFT JOIN users ON availabilities.user_id = users.id\nWHERE\n    availabilities.user_id::uuid = :userId"};

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
 * ```
 */
export const getAvailabilityForVolunteer = new PreparedQuery<IGetAvailabilityForVolunteerParams,IGetAvailabilityForVolunteerResult>(getAvailabilityForVolunteerIR);


/** 'GetAvailabilityForLegacyVolunteer' parameters type */
export interface IGetAvailabilityForLegacyVolunteerParams {
  mongoUserId?: string | null | void;
}

/** 'GetAvailabilityForLegacyVolunteer' return type */
export interface IGetAvailabilityForLegacyVolunteerResult {
  availableEnd: number;
  availableStart: number;
  id: string;
  timezone: string;
  weekday: string;
}

/** 'GetAvailabilityForLegacyVolunteer' query type */
export interface IGetAvailabilityForLegacyVolunteerQuery {
  params: IGetAvailabilityForLegacyVolunteerParams;
  result: IGetAvailabilityForLegacyVolunteerResult;
}

const getAvailabilityForLegacyVolunteerIR: any = {"usedParamSet":{"mongoUserId":true},"params":[{"name":"mongoUserId","required":false,"transform":{"type":"scalar"},"locs":[{"a":337,"b":348}]}],"statement":"SELECT\n    availabilities.id,\n    availabilities.available_start,\n    availabilities.available_end,\n    availabilities.timezone,\n    weekdays.day AS weekday\nFROM\n    availabilities\n    LEFT JOIN weekdays ON availabilities.weekday_id = weekdays.id\n    LEFT JOIN users ON availabilities.user_id = users.id\nWHERE\n    users.mongo_id::text = :mongoUserId"};

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
 *     users.mongo_id::text = :mongoUserId
 * ```
 */
export const getAvailabilityForLegacyVolunteer = new PreparedQuery<IGetAvailabilityForLegacyVolunteerParams,IGetAvailabilityForLegacyVolunteerResult>(getAvailabilityForLegacyVolunteerIR);


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

const getAvailabilityForVolunteerHeatmapIR: any = {"usedParamSet":{"subject":true},"params":[{"name":"subject","required":true,"transform":{"type":"scalar"},"locs":[{"a":231,"b":239},{"a":469,"b":477},{"a":1316,"b":1324},{"a":1916,"b":1924}]}],"statement":"WITH certs_for_subject AS (\n    SELECT\n        COUNT(*)::int AS total\n    FROM\n        certification_subject_unlocks\n        JOIN subjects ON subjects.id = certification_subject_unlocks.subject_id\n    WHERE\n        subjects.name = :subject!\n),\ncerts_for_computed_subject AS (\n    SELECT\n        COUNT(*)::int AS total\n    FROM\n        computed_subject_unlocks\n        JOIN subjects ON subjects.id = computed_subject_unlocks.subject_id\n    WHERE\n        subjects.name = :subject!\n)\nSELECT\n    availabilities.id,\n    availabilities.available_start,\n    availabilities.available_end,\n    availabilities.timezone,\n    availabilities.user_id,\n    weekdays.day AS weekday\nFROM\n    availabilities\n    LEFT JOIN weekdays ON availabilities.weekday_id = weekdays.id\n    JOIN users ON users.id = availabilities.user_id\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN (\n        SELECT\n            users_certifications.user_id,\n            COUNT(*)::int AS earned_certs,\n            certs_for_subject.total\n        FROM\n            users_certifications\n            JOIN certification_subject_unlocks USING (certification_id)\n            JOIN subjects ON certification_subject_unlocks.subject_id = subjects.id\n            JOIN certs_for_subject ON TRUE\n        WHERE\n            subjects.name = :subject!\n        GROUP BY\n            users_certifications.user_id, subjects.name, certs_for_subject.total) user_certs ON user_certs.user_id = users.id\n    LEFT JOIN (\n        SELECT\n            users_certifications.user_id,\n            COUNT(*)::int AS earned_certs,\n            certs_for_computed_subject.total\n        FROM\n            users_certifications\n            JOIN computed_subject_unlocks USING (certification_id)\n            JOIN subjects ON computed_subject_unlocks.subject_id = subjects.id\n            JOIN certs_for_computed_subject ON TRUE\n        WHERE\n            subjects.name = :subject!\n        GROUP BY\n            users_certifications.user_id, subjects.name, certs_for_computed_subject.total\n        HAVING\n            COUNT(*)::int >= certs_for_computed_subject.total) user_computed_subjects ON user_computed_subjects.user_id = users.id\nWHERE\n    users.test_user IS FALSE\n    AND volunteer_profiles.onboarded IS TRUE\n    AND users.deactivated IS FALSE\n    AND users.deleted IS FALSE\n    AND users.ban_type IS DISTINCT FROM 'complete'\n    AND (user_certs.total IS NOT NULL\n        OR user_computed_subjects.total IS NOT NULL)"};

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
 *     AND users.deleted IS FALSE
 *     AND users.ban_type IS DISTINCT FROM 'complete'
 *     AND (user_certs.total IS NOT NULL
 *         OR user_computed_subjects.total IS NOT NULL)
 * ```
 */
export const getAvailabilityForVolunteerHeatmap = new PreparedQuery<IGetAvailabilityForVolunteerHeatmapParams,IGetAvailabilityForVolunteerHeatmapResult>(getAvailabilityForVolunteerHeatmapIR);


/** 'GetAvailabilityHistoryForDatesByVolunteerId' parameters type */
export interface IGetAvailabilityHistoryForDatesByVolunteerIdParams {
  end: DateOrString;
  start: DateOrString;
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

const getAvailabilityHistoryForDatesByVolunteerIdIR: any = {"usedParamSet":{"userId":true,"start":true,"end":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":355,"b":362}]},{"name":"start","required":true,"transform":{"type":"scalar"},"locs":[{"a":387,"b":393}]},{"name":"end","required":true,"transform":{"type":"scalar"},"locs":[{"a":418,"b":422}]}],"statement":"SELECT\n    availability_histories.id,\n    availability_histories.recorded_at,\n    availability_histories.available_start,\n    availability_histories.available_end,\n    availability_histories.timezone,\n    weekdays.day AS weekday\nFROM\n    availability_histories\n    LEFT JOIN weekdays ON availability_histories.weekday_id = weekdays.id\nWHERE\n    user_id = :userId!\n    AND recorded_at >= :start!\n    AND recorded_at <= :end!\nORDER BY\n    recorded_at"};

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
  end: DateOrString;
  start: DateOrString;
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

const getLegacyAvailabilityHistoryForDatesByVolunteerIdIR: any = {"usedParamSet":{"userId":true,"start":true,"end":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":249,"b":256}]},{"name":"start","required":true,"transform":{"type":"scalar"},"locs":[{"a":281,"b":287}]},{"name":"end","required":true,"transform":{"type":"scalar"},"locs":[{"a":312,"b":316}]}],"statement":"SELECT\n    legacy_availability_histories.id,\n    legacy_availability_histories.recorded_at,\n    legacy_availability_histories.legacy_availability,\n    legacy_availability_histories.timezone\nFROM\n    legacy_availability_histories\nWHERE\n    user_id = :userId!\n    AND recorded_at >= :start!\n    AND recorded_at <= :end!\nORDER BY\n    recorded_at"};

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

const saveCurrentAvailabilityAsHistoryIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":328,"b":335}]}],"statement":"INSERT INTO availability_histories (id, recorded_at, user_id, available_start, available_end, timezone, weekday_id, created_at, updated_at)\nSELECT\n    generate_ulid (),\n    NOW(),\n    user_id,\n    available_start,\n    available_end,\n    timezone,\n    weekday_id,\n    NOW(),\n    NOW()\nFROM\n    availabilities\nWHERE\n    user_id = :userId!\nRETURNING\n    id AS ok"};

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

const insertNewAvailabilityIR: any = {"usedParamSet":{"id":true,"userId":true,"availableStart":true,"availableEnd":true,"timezone":true,"day":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":130,"b":133}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":140,"b":147}]},{"name":"availableStart","required":true,"transform":{"type":"scalar"},"locs":[{"a":162,"b":177}]},{"name":"availableEnd","required":true,"transform":{"type":"scalar"},"locs":[{"a":184,"b":197}]},{"name":"timezone","required":true,"transform":{"type":"scalar"},"locs":[{"a":204,"b":213}]},{"name":"day","required":true,"transform":{"type":"scalar"},"locs":[{"a":271,"b":275}]}],"statement":"INSERT INTO availabilities (id, user_id, weekday_id, available_start, available_end, timezone, created_at, updated_at)\nSELECT\n    :id!,\n    :userId!,\n    id,\n    :availableStart!,\n    :availableEnd!,\n    :timezone!,\n    NOW(),\n    NOW()\nFROM\n    weekdays\nWHERE\n    day = :day!\nRETURNING\n    id AS ok"};

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

const clearAvailabilityForVolunteerIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":43,"b":50}]}],"statement":"DELETE FROM availabilities\nWHERE user_id = :userId!\nRETURNING\n    user_id AS ok"};

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


/** 'DeleteAvailabilityHistoriesForUser' parameters type */
export interface IDeleteAvailabilityHistoriesForUserParams {
  userId: string;
}

/** 'DeleteAvailabilityHistoriesForUser' return type */
export type IDeleteAvailabilityHistoriesForUserResult = void;

/** 'DeleteAvailabilityHistoriesForUser' query type */
export interface IDeleteAvailabilityHistoriesForUserQuery {
  params: IDeleteAvailabilityHistoriesForUserParams;
  result: IDeleteAvailabilityHistoriesForUserResult;
}

const deleteAvailabilityHistoriesForUserIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":51,"b":58}]}],"statement":"DELETE FROM availability_histories\nWHERE user_id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM availability_histories
 * WHERE user_id = :userId!
 * ```
 */
export const deleteAvailabilityHistoriesForUser = new PreparedQuery<IDeleteAvailabilityHistoriesForUserParams,IDeleteAvailabilityHistoriesForUserResult>(deleteAvailabilityHistoriesForUserIR);


/** 'DeleteLegacyAvailabilityHistoriesForUser' parameters type */
export interface IDeleteLegacyAvailabilityHistoriesForUserParams {
  userId: string;
}

/** 'DeleteLegacyAvailabilityHistoriesForUser' return type */
export type IDeleteLegacyAvailabilityHistoriesForUserResult = void;

/** 'DeleteLegacyAvailabilityHistoriesForUser' query type */
export interface IDeleteLegacyAvailabilityHistoriesForUserQuery {
  params: IDeleteLegacyAvailabilityHistoriesForUserParams;
  result: IDeleteLegacyAvailabilityHistoriesForUserResult;
}

const deleteLegacyAvailabilityHistoriesForUserIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":58,"b":65}]}],"statement":"DELETE FROM legacy_availability_histories\nWHERE user_id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM legacy_availability_histories
 * WHERE user_id = :userId!
 * ```
 */
export const deleteLegacyAvailabilityHistoriesForUser = new PreparedQuery<IDeleteLegacyAvailabilityHistoriesForUserParams,IDeleteLegacyAvailabilityHistoriesForUserResult>(deleteLegacyAvailabilityHistoriesForUserIR);



/** Types generated for queries found in "server/models/Availability/availability.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'GetAvailabilityForVolunteer' parameters type */
export interface IGetAvailabilityForVolunteerParams {
  userId: string;
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

const getAvailabilityForVolunteerIR: any = {"name":"getAvailabilityForVolunteer","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":308,"b":314,"line":12,"col":15}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    availabilities.id,\n    availabilities.available_start,\n    availabilities.available_end,\n    availabilities.timezone,\n    weekdays.day AS weekday\nFROM\n    availabilities\n    LEFT JOIN weekdays ON availabilities.weekday_id = weekdays.id\nWHERE\n    user_id = :userId!","loc":{"a":40,"b":314,"line":2,"col":0}}};

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
 * WHERE
 *     user_id = :userId!
 * ```
 */
export const getAvailabilityForVolunteer = new PreparedQuery<IGetAvailabilityForVolunteerParams,IGetAvailabilityForVolunteerResult>(getAvailabilityForVolunteerIR);


/** 'GetAvailabilityForVolunteers' parameters type */
export interface IGetAvailabilityForVolunteersParams {
  userIds: readonly (string)[];
}

/** 'GetAvailabilityForVolunteers' return type */
export interface IGetAvailabilityForVolunteersResult {
  availableEnd: number;
  availableStart: number;
  id: string;
  timezone: string;
  userId: string;
  weekday: string;
}

/** 'GetAvailabilityForVolunteers' query type */
export interface IGetAvailabilityForVolunteersQuery {
  params: IGetAvailabilityForVolunteersParams;
  result: IGetAvailabilityForVolunteersResult;
}

const getAvailabilityForVolunteersIR: any = {"name":"getAvailabilityForVolunteers","params":[{"name":"userIds","codeRefs":{"defined":{"a":368,"b":374,"line":17,"col":8},"used":[{"a":686,"b":693,"line":30,"col":16}]},"transform":{"type":"array_spread"},"required":true}],"usedParamSet":{"userIds":true},"statement":{"body":"SELECT\n    availabilities.id,\n    availabilities.available_start,\n    availabilities.available_end,\n    availabilities.timezone,\n    availabilities.user_id,\n    weekdays.day AS weekday\nFROM\n    availabilities\n    LEFT JOIN weekdays ON availabilities.weekday_id = weekdays.id\nWHERE\n    user_id IN :userIds!","loc":{"a":389,"b":693,"line":19,"col":0}}};

/**
 * Query generated from SQL:
 * ```
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
 * WHERE
 *     user_id IN :userIds!
 * ```
 */
export const getAvailabilityForVolunteers = new PreparedQuery<IGetAvailabilityForVolunteersParams,IGetAvailabilityForVolunteersResult>(getAvailabilityForVolunteersIR);


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

const getAvailabilityHistoryForDatesByVolunteerIdIR: any = {"name":"getAvailabilityHistoryForDatesByVolunteerId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1110,"b":1116,"line":45,"col":15},{"a":1340,"b":1346,"line":54,"col":27}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1142,"b":1145,"line":46,"col":24}]}},{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1306,"b":1311,"line":53,"col":28}]}}],"usedParamSet":{"userId":true,"end":true,"start":true},"statement":{"body":"SELECT\n    availability_histories.id,\n    availability_histories.recorded_at,\n    availability_histories.available_start,\n    availability_histories.available_end,\n    availability_histories.timezone,\n    weekdays.day AS weekday\nFROM\n    availability_histories\n    LEFT JOIN weekdays ON availability_histories.weekday_id = weekdays.id\nWHERE\n    user_id = :userId!\n    AND recorded_at <= :end!\n    AND recorded_at >= (\n        SELECT\n            MAX(recorded_at)\n        FROM\n            availability_histories\n        WHERE\n            recorded_at <= :start!\n            AND user_id = :userId!)\nORDER BY\n    recorded_at","loc":{"a":754,"b":1372,"line":34,"col":0}}};

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
 *     AND recorded_at <= :end!
 *     AND recorded_at >= (
 *         SELECT
 *             MAX(recorded_at)
 *         FROM
 *             availability_histories
 *         WHERE
 *             recorded_at <= :start!
 *             AND user_id = :userId!)
 * ORDER BY
 *     recorded_at
 * ```
 */
export const getAvailabilityHistoryForDatesByVolunteerId = new PreparedQuery<IGetAvailabilityHistoryForDatesByVolunteerIdParams,IGetAvailabilityHistoryForDatesByVolunteerIdResult>(getAvailabilityHistoryForDatesByVolunteerIdIR);


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

const saveCurrentAvailabilityAsHistoryIR: any = {"name":"saveCurrentAvailabilityAsHistory","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1750,"b":1756,"line":74,"col":15}]}}],"usedParamSet":{"userId":true},"statement":{"body":"INSERT INTO availability_histories (id, recorded_at, user_id, available_start, available_end, timezone, weekday_id, created_at, updated_at)\nSELECT\n    generate_ulid(),\n    NOW(),\n    user_id,\n    available_start,\n    available_end,\n    timezone,\n    weekday_id,\n    NOW(),\n    NOW()\nFROM\n    availabilities\nWHERE\n    user_id = :userId!\nRETURNING\n    id AS ok","loc":{"a":1422,"b":1779,"line":60,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO availability_histories (id, recorded_at, user_id, available_start, available_end, timezone, weekday_id, created_at, updated_at)
 * SELECT
 *     generate_ulid(),
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
export type IInsertNewAvailabilityResult = void;

/** 'InsertNewAvailability' query type */
export interface IInsertNewAvailabilityQuery {
  params: IInsertNewAvailabilityParams;
  result: IInsertNewAvailabilityResult;
}

const insertNewAvailabilityIR: any = {"name":"insertNewAvailability","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1949,"b":1951,"line":82,"col":5}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1959,"b":1965,"line":83,"col":5}]}},{"name":"availableStart","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1981,"b":1995,"line":85,"col":5}]}},{"name":"availableEnd","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2003,"b":2015,"line":86,"col":5}]}},{"name":"timezone","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2023,"b":2031,"line":87,"col":5}]}},{"name":"day","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2090,"b":2093,"line":93,"col":11}]}}],"usedParamSet":{"id":true,"userId":true,"availableStart":true,"availableEnd":true,"timezone":true,"day":true},"statement":{"body":"INSERT INTO availabilities (id, user_id, weekday_id, available_start, available_end, timezone, created_at, updated_at)\nSELECT\n    :id!,\n    :userId!,\n    id,\n    :availableStart!,\n    :availableEnd!,\n    :timezone!,\n    NOW(),\n    NOW()\nFROM\n    weekdays\nWHERE\n    day = :day!","loc":{"a":1818,"b":2093,"line":80,"col":0}}};

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

const clearAvailabilityForVolunteerIR: any = {"name":"clearAvailabilityForVolunteer","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2184,"b":2190,"line":98,"col":17}]}}],"usedParamSet":{"userId":true},"statement":{"body":"DELETE FROM availabilities\nWHERE user_id = :userId!\nRETURNING\n    user_id AS ok","loc":{"a":2140,"b":2218,"line":97,"col":0}}};

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

const saveLegacyAvailabilityIR: any = {"name":"saveLegacyAvailability","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2394,"b":2396,"line":106,"col":5}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2404,"b":2410,"line":107,"col":5},{"a":2539,"b":2545,"line":116,"col":15}]}},{"name":"availability","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2458,"b":2470,"line":110,"col":5}]}}],"usedParamSet":{"id":true,"userId":true,"availability":true},"statement":{"body":"INSERT INTO legacy_availability_histories (id, user_id, timezone, recorded_at, legacy_availability, created_at, updated_at)\nSELECT\n    :id!,\n    :userId!,\n    availabilities.timezone,\n    NOW(),\n    :availability!,\n    NOW(),\n    NOW()\nFROM\n    availabilities\nWHERE\n    user_id = :userId!\nLIMIT 1\nRETURNING\n    id AS ok","loc":{"a":2258,"b":2576,"line":104,"col":0}}};

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



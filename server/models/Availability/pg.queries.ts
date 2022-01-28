/** Types generated for queries found in "server/models/Availability/availability.sql" */
import { PreparedQuery } from '@pgtyped/query';

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

const getAvailabilityHistoryForDatesByVolunteerIdIR: any = {"name":"getAvailabilityHistoryForDatesByVolunteerId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":731,"b":737,"line":27,"col":15},{"a":961,"b":967,"line":36,"col":27}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":763,"b":766,"line":28,"col":24}]}},{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":927,"b":932,"line":35,"col":28}]}}],"usedParamSet":{"userId":true,"end":true,"start":true},"statement":{"body":"SELECT\n    availability_histories.id,\n    availability_histories.recorded_at,\n    availability_histories.available_start,\n    availability_histories.available_end,\n    availability_histories.timezone,\n    weekdays.day AS weekday\nFROM\n    availability_histories\n    LEFT JOIN weekdays ON availability_histories.weekday_id = weekdays.id\nWHERE\n    user_id = :userId!\n    AND recorded_at <= :end!\n    AND recorded_at >= (\n        SELECT\n            MAX(recorded_at)\n        FROM\n            availability_histories\n        WHERE\n            recorded_at <= :start!\n            AND user_id = :userId!)\nORDER BY\n    recorded_at","loc":{"a":375,"b":993,"line":16,"col":0}}};

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



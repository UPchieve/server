/** Types generated for queries found in "server/models/Availability/availability.sql" */
import { PreparedQuery } from '@pgtyped/query'

/** 'GetAvailabilityForVolunteer' parameters type */
export interface IGetAvailabilityForVolunteerParams {
  userId: string
}

/** 'GetAvailabilityForVolunteer' return type */
export interface IGetAvailabilityForVolunteerResult {
  availableEnd: number | null
  availableStart: number | null
  id: string
  timezone: string | null
  weekday: string
}

/** 'GetAvailabilityForVolunteer' query type */
export interface IGetAvailabilityForVolunteerQuery {
  params: IGetAvailabilityForVolunteerParams
  result: IGetAvailabilityForVolunteerResult
}

const getAvailabilityForVolunteerIR: any = {
  name: 'getAvailabilityForVolunteer',
  params: [
    {
      name: 'userId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 292, b: 298, line: 12, col: 13 }] },
    },
  ],
  usedParamSet: { userId: true },
  statement: {
    body:
      'SELECT\n  availabilities.id,\n  availabilities.available_start,\n  availabilities.available_end,\n  availabilities.timezone,\n  weekdays.day AS weekday\nFROM\n  availabilities\n  LEFT JOIN weekdays ON availabilities.weekday_id = weekdays.id\nWHERE\n  user_id = :userId!',
    loc: { a: 40, b: 298, line: 2, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   availabilities.id,
 *   availabilities.available_start,
 *   availabilities.available_end,
 *   availabilities.timezone,
 *   weekdays.day AS weekday
 * FROM
 *   availabilities
 *   LEFT JOIN weekdays ON availabilities.weekday_id = weekdays.id
 * WHERE
 *   user_id = :userId!
 * ```
 */
export const getAvailabilityForVolunteer = new PreparedQuery<
  IGetAvailabilityForVolunteerParams,
  IGetAvailabilityForVolunteerResult
>(getAvailabilityForVolunteerIR)

/** 'GetAvailabilityHistoryForDatesByVolunteerId' parameters type */
export interface IGetAvailabilityHistoryForDatesByVolunteerIdParams {
  end: Date
  start: Date
  userId: string
}

/** 'GetAvailabilityHistoryForDatesByVolunteerId' return type */
export interface IGetAvailabilityHistoryForDatesByVolunteerIdResult {
  availableEnd: number | null
  availableStart: number | null
  id: string
  recordedAt: Date | null
  timezone: string | null
  weekday: string
}

/** 'GetAvailabilityHistoryForDatesByVolunteerId' query type */
export interface IGetAvailabilityHistoryForDatesByVolunteerIdQuery {
  params: IGetAvailabilityHistoryForDatesByVolunteerIdParams
  result: IGetAvailabilityHistoryForDatesByVolunteerIdResult
}

const getAvailabilityHistoryForDatesByVolunteerIdIR: any = {
  name: 'getAvailabilityHistoryForDatesByVolunteerId',
  params: [
    {
      name: 'userId',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: {
        used: [
          { a: 695, b: 701, line: 25, col: 13 },
          { a: 869, b: 875, line: 34, col: 19 },
        ],
      },
    },
    {
      name: 'end',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 725, b: 728, line: 26, col: 22 }] },
    },
    {
      name: 'start',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 843, b: 848, line: 33, col: 20 }] },
    },
  ],
  usedParamSet: { userId: true, end: true, start: true },
  statement: {
    body:
      'SELECT\n  availability_histories.id,\n  availability_histories.recorded_at,\n  availability_histories.available_start,\n  availability_histories.available_end,\n  availability_histories.timezone,\n  weekdays.day AS weekday\nFROM\n  availability_histories\n  LEFT JOIN weekdays ON availability_histories.weekday_id = weekdays.id\nWHERE\n  user_id = :userId!\n  AND recorded_at <= :end!\nAND recorded_at >= (\n  SELECT\n    MAX(recorded_at)\n  FROM\n    availability_histories\n  WHERE\n    recorded_at <= :start!\n    AND user_id = :userId!\n)\nORDER BY\n  recorded_at',
    loc: { a: 357, b: 900, line: 14, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   availability_histories.id,
 *   availability_histories.recorded_at,
 *   availability_histories.available_start,
 *   availability_histories.available_end,
 *   availability_histories.timezone,
 *   weekdays.day AS weekday
 * FROM
 *   availability_histories
 *   LEFT JOIN weekdays ON availability_histories.weekday_id = weekdays.id
 * WHERE
 *   user_id = :userId!
 *   AND recorded_at <= :end!
 * AND recorded_at >= (
 *   SELECT
 *     MAX(recorded_at)
 *   FROM
 *     availability_histories
 *   WHERE
 *     recorded_at <= :start!
 *     AND user_id = :userId!
 * )
 * ORDER BY
 *   recorded_at
 * ```
 */
export const getAvailabilityHistoryForDatesByVolunteerId = new PreparedQuery<
  IGetAvailabilityHistoryForDatesByVolunteerIdParams,
  IGetAvailabilityHistoryForDatesByVolunteerIdResult
>(getAvailabilityHistoryForDatesByVolunteerIdIR)

import * as db from 'zapatos/db'
import * as schema from 'zapatos/schema'
import _ from 'lodash'
import moment from 'moment'

import pool from '../../pg'
import * as pgUtils from '../pgUtils'
import { Availability, DAYS, HOURS } from './types'
import { RepoReadError } from '../Errors'
import createNewAvailability from '../../utils/create-new-availability'

function getAvailabilityHour(baseHour: number): HOURS {
  let hour: string

  if (baseHour >= 12) {
    if (baseHour > 12) {
      baseHour -= 12
    }
    hour = `${baseHour}p`
  } else {
    if (baseHour === 0) {
      baseHour = 12
    }
    hour = `${baseHour}a`
  }

  return hour as HOURS
}

const day_array = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]
export function getAvailabilityDay(baseDay: number): DAYS {
  return day_array[baseDay] as DAYS
}

export interface AvailabilityHistory {
  volunteerId: pgUtils.ObjectId
  availability: Availability
  recordedAt: Date
}

type AvailabilityRow = schema.availabilities.Selectable & { weekday: schema.weekdays.Selectable['day'] }

function buildAvailabilityModel(rows: AvailabilityRow[]): Availability {
  const availability = createNewAvailability()
  for (const row of rows) {
    if (!row.available_start || !row.available_end || !row.timezone) continue
    const tzTime = moment().tz(row.timezone).day(row.weekday)
    const day = getAvailabilityDay(tzTime.day())
    for (let i = row.available_start; i < row.available_end; i++) {
      const hour = getAvailabilityHour(i)
      availability[day][hour] = true
    }
  }
  return availability
}

export async function getAvaiabilityForVolunteer(userId: pgUtils.Ulid): Promise<Availability | undefined> {
  try {
    type availabilityWeekedaysSQL = schema.availabilities.SQL | schema.weekdays.SQL | 'weekday'
    const result = await db.sql<availabilityWeekedaysSQL, AvailabilityRow[]>`
      SELECT 
        ${"availabilities"}.${db.cols(['id', 'available_start', 'available_end', 'timezone'])},
        ${"weekdays"}.${"day"} AS ${"weekday"} 
      FROM ${"availabilities"}
      LEFT JOIN ${"weekdays"} ON ${"availabilities"}.${"weekday_id"} = ${"weekdays"}.${"id"}
      WHERE ${"user_id"} = ${db.param(userId)}
    `.run(pool)
    return buildAvailabilityModel(result)
  } catch (err) {
    throw new RepoReadError(err)
  }
}

type AvailabilityHistoryRow = schema.availability_histories.Selectable & { weekday: schema.weekdays.Selectable['day'] }
export async function getAvailabilityHistoryForDatesByVolunteerId(
  userId: pgUtils.Ulid,
  start: Date,
  end: Date
): Promise<AvailabilityHistory[]> {
  try {
    type availabilityHistoriesSQL = schema.availability_histories.SQL | schema.weekdays.SQL | 'weekday'
    const result = await db.sql<availabilityHistoriesSQL, AvailabilityHistoryRow[]>`
      SELECT
        ${"availability_histories"}.${db.cols(['id', 'recorded_at', 'available_start', 'available_end', 'timezone'])},
        ${"weekdays"}.${"day"} AS ${"weekday"},
      FROM ${"availability_histories"}
      LEFT JOIN ${"weekdays"} ON ${"availability_histories"}.${"weekday_id"} = ${"weekdays"}.${"id"}
      WHERE
        ${"user_id"} = ${db.param(userId)},
        ${"recorded_at"} <= ${db.param(end)},
        ${"recorded_at"} >= (
          SELECT 
            MAX(${"recorded_at"}) 
          FROM ${"availability_histories"} 
          WHERE 
            ${"recorded_at"} <= ${db.param(start)},
            ${"user_id"} = ${db.param(userId)}
          )
      ORDER BY ${"recorded_at"}
    `.run(pool)
    const rowsByDate = _.groupBy(result, 'recorded_at')

    const histories: AvailabilityHistory[] = []
    for (const [date, rows] of Object.entries(rowsByDate).sort((a,b) => new Date(a[0]) > new Date(b[0]) ? 1 : -1)) {
      const availability = buildAvailabilityModel(rows)
      histories.push({
        volunteerId: userId,
        recordedAt: new Date(date),
        availability 
      })
    }
    return histories
  } catch (err) {
    throw new RepoReadError(err)
  }
}

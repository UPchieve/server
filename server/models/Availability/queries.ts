import { getClient } from '../../db'
import * as pgQueries from './pg.queries'
import { Ulid, getDbUlid, makeRequired, makeSomeOptional } from '../pgUtils'

import _ from 'lodash'
import moment from 'moment'
import 'moment-timezone'
import { DAYS, HOURS, HOUR_TO_UTC_MAPPING } from '../../constants'
import {
  Availability,
  AvailabilityDay,
  AvailabilityHistory,
  AvailabilitySnapshot,
} from './types'
import { RepoCreateError, RepoReadError, RepoUpdateError } from '../Errors'
import { PoolClient } from 'pg'
import { isPgId } from '../../utils/type-utils'

function createNewAvailability(): Availability {
  const availability: Partial<Availability> = {}

  for (const day of DAYS) {
    const temp: Partial<AvailabilityDay> = {}
    for (const hour of HOURS) {
      temp[hour] = false
    }
    availability[day] = temp as AvailabilityDay
  }

  return availability as Availability
}

function getAvailabilityHour(rawHour: number): HOURS {
  let baseHour = rawHour
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
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]
export function getAvailabilityDay(baseDay: number): DAYS {
  return day_array[baseDay] as DAYS
}

type AvailabilityRow = {
  availableEnd: number
  availableStart: number
  id: string
  timezone: string
  weekday: string
}

/**
 * All database rows are currently saved in EST regardless of the user's actual timezone
 * TODO: save rows (and backfill) in user's actual timezone and do conversion server side
 * @param rows availability rows straight form postgres
 * @returns an Availability object model
 */
function buildAvailabilityModel(rows: AvailabilityRow[]): Availability {
  const availability = createNewAvailability()
  for (const row of rows) {
    for (let i: number = row.availableStart; i < row.availableEnd; i++) {
      const hour = getAvailabilityHour(i)
      availability[row.weekday as DAYS][hour] = true
    }
  }
  return availability
}

export async function getAvailabilityForVolunteer(
  userId: Ulid,
  poolClient?: PoolClient
): Promise<Availability> {
  const client = poolClient ? poolClient : getClient()
  try {
    const result = await pgQueries.getAvailabilityForVolunteer.run(
      {
        userId: isPgId(userId) ? userId : undefined,
        mongoUserId: isPgId(userId) ? undefined : userId,
      },
      client
    )
    return buildAvailabilityModel(result.map(v => makeRequired(v)))
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getAvailabilityForVolunteerHeatmap(
  subject: string
): Promise<AvailabilitySnapshot[]> {
  try {
    const result = await pgQueries.getAvailabilityForVolunteerHeatmap.run(
      { subject },
      getClient()
    )
    const availabilities: AvailabilitySnapshot[] = []
    const groups = _.groupBy(
      result.map(v => makeRequired(v)),
      row => row.userId
    )
    for (const user in groups) {
      const rows = groups[user]
      availabilities.push({
        volunteerId: user,
        availability: buildAvailabilityModel(rows),
      })
    }
    return availabilities
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getAvailabilityHistoryForDatesByVolunteerId(
  userId: Ulid,
  start: Date,
  end: Date
): Promise<AvailabilityHistory[]> {
  try {
    const result = await pgQueries.getAvailabilityHistoryForDatesByVolunteerId.run(
      { userId, start, end },
      getClient()
    )
    const rows = result.map(row => makeRequired(row))
    const rowsByDate = _.groupBy(rows, 'recordedAt')

    const histories: AvailabilityHistory[] = []
    for (const [date, rows] of Object.entries(rowsByDate).sort((a, b) =>
      new Date(a[0]) > new Date(b[0]) ? 1 : -1
    )) {
      const availability = buildAvailabilityModel(
        rows.map(v => makeRequired(v))
      )
      histories.push({
        volunteerId: userId,
        recordedAt: new Date(date),
        availability,
      })
    }
    return histories
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getLegacyAvailabilityHistoryForDatesByVolunteerId(
  userId: Ulid,
  start: Date,
  end: Date
): Promise<AvailabilityHistory[]> {
  try {
    const result = await pgQueries.getLegacyAvailabilityHistoryForDatesByVolunteerId.run(
      { userId, start, end },
      getClient()
    )
    const rows = result.map(row => makeSomeOptional(row, ['timezone']))
    const rowsByDate = _.groupBy(rows, 'recordedAt')
    const histories: AvailabilityHistory[] = []
    for (const [date, rows] of Object.entries(rowsByDate).sort((a, b) =>
      new Date(a[0]) > new Date(b[0]) ? 1 : -1
    )) {
      // NOTE: the DB currently has duplicate entries for legacy_availabilities, ignore duplicates here
      const row = rows[0]
      const availability = createNewAvailability()
      const day = getAvailabilityDay(moment(row.recordedAt).day())
      histories.push({
        volunteerId: userId,
        recordedAt: new Date(row.recordedAt),
        availability: Object.assign(availability, {
          [day]: row.legacyAvailability,
        }),
      })
    }

    return histories
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function saveCurrentAvailabilityAsHistory(
  userId: Ulid
): Promise<void> {
  try {
    const result = await pgQueries.saveCurrentAvailabilityAsHistory.run(
      { userId },
      getClient()
    )
    const errors = []
    for (const row of result) {
      if (!makeRequired(row).ok)
        errors.push(`AvailabilityHistory row ${row} did not save correctly`)
    }
    if (errors.length) throw new Error(errors.join('\n'))
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function saveAvailabilityAsHistoryByDate(
  userId: Ulid,
  outageDate: Date
): Promise<void> {
  try {
    const result = await pgQueries.saveAvailabilityAsHistoryByDate.run(
      { userId, recordedAt: outageDate },
      getClient()
    )
    const errors = []
    for (const row of result) {
      if (!makeRequired(row).ok)
        errors.push(`AvailabilityHistory row ${row} did not save correctly`)
    }
    if (errors.length) throw new Error(errors.join('\n'))
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function getAvailabilityForVolunteerByDate(
  userId: Ulid,
  date: Date
): Promise<Availability> {
  try {
    const result = await pgQueries.getAvailabilityForVolunteerByDate.run(
      { userId, recordedAt: date },
      getClient()
    )
    return buildAvailabilityModel(result.map(v => makeRequired(v)))
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function updateAvailabilityByVolunteerId(
  userId: Ulid,
  availability: Availability,
  timezone: string
): Promise<void> {
  const client = await getClient().connect()
  try {
    const rows: pgQueries.IInsertNewAvailabilityParams[] = []
    for (const day in availability) {
      const availabilityDay = availability[day as DAYS]
      for (const hour in availabilityDay) {
        const parsedHour = HOUR_TO_UTC_MAPPING[hour as HOURS]
        if (availabilityDay[hour as HOURS])
          rows.push({
            availableEnd: parsedHour + 1,
            availableStart: parsedHour,
            day,
            id: getDbUlid(),
            timezone: timezone,
            userId,
          })
      }
    }
    const errors: string[] = []
    await client.query('BEGIN')
    for (const row of rows) {
      const result = await pgQueries.insertNewAvailability.run(
        { ...row },
        client
      )
      if (!(result.length && makeRequired(result[0])))
        errors.push(
          `Availability row ${JSON.stringify(row)} did not save correctly`
        )
    }
    if (errors.length) throw new Error(errors.join('\n'))
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw new RepoUpdateError(err)
  } finally {
    client.release()
  }
}

export async function clearAvailabilityForVolunteer(
  userId: Ulid
): Promise<void> {
  try {
    const result = await pgQueries.clearAvailabilityForVolunteer.run(
      { userId },
      getClient()
    )
    if (!result.length && makeRequired(result[0]).ok)
      throw new RepoUpdateError('Update query did not return ok')
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function saveLegacyAvailability(
  userId: Ulid,
  availability: any
): Promise<void> {
  try {
    const result = await pgQueries.saveLegacyAvailability.run(
      { id: getDbUlid(), userId, availability },
      getClient()
    )
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

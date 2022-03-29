import { getClient } from '../../pg'
import * as pgQueries from './pg.queries'
import { Ulid, getDbUlid, makeRequired } from '../pgUtils'

import _ from 'lodash'
import moment from 'moment'
import {
  Availability,
  HOURS,
  DAYS,
  AvailabilityDay,
  AvailabilityHistory,
  AvailabilitySnapshot,
} from './types'
import { RepoCreateError, RepoReadError, RepoUpdateError } from '../Errors'
import { PoolClient } from 'pg'

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

function buildAvailabilityModel(
  rows: AvailabilityRow[]
): Availability {
  const availability = createNewAvailability()
  for (const row of rows) {
    if (!row.availableStart || !row.availableEnd || !row.timezone) continue
    const tzTime = moment()
      .tz(row.timezone)
      .day(row.weekday)
    const day = getAvailabilityDay(tzTime.day())
    for (let i = row.availableStart; i < row.availableEnd; i++) {
      const hour = getAvailabilityHour(i)
      availability[day][hour] = true
    }
  }
  return availability
}

export async function getAvailabilityForVolunteer(
  userId: Ulid, poolClient?: PoolClient
): Promise<Availability> {
  const client = poolClient ? poolClient : getClient()
  try {
    const result = await pgQueries.getAvailabilityForVolunteer.run(
      { userId },
      client
    )
    return buildAvailabilityModel(result.map(v => makeRequired(v)))
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getAvailabilityForVolunteers(
  userIds: Ulid[]
): Promise<AvailabilitySnapshot[]> {
  try {
    const result = await pgQueries.getAvailabilityForVolunteers.run(
      { userIds },
      getClient()
    )
    const availabilities: AvailabilitySnapshot[] = []
    const groups = _.groupBy(result, row => row.userId)
    for (const user in groups) {
      const rows = groups[user]
      availabilities.push({
        volunteerId: user,
        availability: buildAvailabilityModel(rows.map(v => makeRequired(v))),
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
    const rowsByDate = _.groupBy(result, 'recordedAt')

    const histories: AvailabilityHistory[] = []
    for (const [date, rows] of Object.entries(rowsByDate).sort((a, b) =>
      new Date(a[0]) > new Date(b[0]) ? 1 : -1
    )) {
      const availability = buildAvailabilityModel(rows.map(v => makeRequired(v)))
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

export async function updateAvailabilityByVolunteerId(
  userId: Ulid,
  availability: Availability,
  timezone: string
): Promise<void> {
  try {
    const rows: pgQueries.IInsertNewAvailabilityParams[] = []
    for (const day in availability) {
      const availabilityDay = availability[day as DAYS]
      for (const hour in availabilityDay) {
        const parsedHour = Number(hour.slice(0, -1))
        if (availabilityDay[hour as HOURS])
          rows.push({
            availableEnd: parsedHour + 1,
            availableStart: parsedHour,
            day,
            id: getDbUlid(),
            timezone: timezone,
            userId
          })
      }
    }
    const errors: string[] = []
    console.log(`Attempting to insert availability OBJECT ${JSON.stringify(availability)}`)
    console.log(`Attempting to insert availability rows ${JSON.stringify(rows)}`)
    for (const row of rows) {
      const result = await pgQueries.insertNewAvailability.run(
        { ...row },
        getClient()
      )
      if (!(result.length && makeRequired(result[0])))
        errors.push(`Availability row ${JSON.stringify(row)} did not save correctly`)
    }
    if (errors.length) throw new Error(errors.join('\n'))
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function clearAvailabilityForVolunteer(userId: Ulid): Promise<void> {
  try {
    const result = await pgQueries.clearAvailabilityForVolunteer.run({ userId }, getClient())
    if (!result.length && makeRequired(result[0]).ok) throw new RepoUpdateError('Update query did not return ok')
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function saveLegacyAvailability(userId: Ulid, availability: any): Promise<void> {
  try {
    const result = await pgQueries.saveLegacyAvailability.run({ id: getDbUlid(), userId, availability }, getClient())
    
  } catch (err) {
    throw new RepoCreateError(err)
  }
}
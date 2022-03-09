import { Types } from 'mongoose'
import AvailabilitySnapshotModel, { AvailabilitySnapshot } from './Snapshot'
import AvailabilityHistoryModel, { AvailabilityHistory } from './History'
import { Availability, HOURS, DAYS } from './types'
import { RepoCreateError, RepoReadError, RepoUpdateError } from '../Errors'

export async function getSnapshotByVolunteerId(
  volunteerId: Types.ObjectId
): Promise<AvailabilitySnapshot | undefined> {
  try {
    const snap = await AvailabilitySnapshotModel.findOne({ volunteerId })
      .lean()
      .exec()
    if (snap) return snap as AvailabilitySnapshot
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getSnapshotsByVolunteerIds(
  volunteerIds: Types.ObjectId[]
): Promise<AvailabilitySnapshot[]> {
  try {
    return await AvailabilitySnapshotModel.find({
      volunteerId: { $in: volunteerIds },
    })
      .lean()
      .exec()
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getHistoryForDatesByVolunteerId(
  volunteerId: Types.ObjectId,
  start: Date,
  end: Date
): Promise<AvailabilityHistory[]> {
  try {
    return (await AvailabilityHistoryModel.find({
      volunteerId,
      date: {
        $gte: start,
        $lte: end,
      },
    })
      .sort({ date: -1 })
      .lean()
      .exec()) as AvailabilityHistory[]
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function createSnapshotByVolunteerId(
  volunteerId: Types.ObjectId
): Promise<AvailabilitySnapshot> {
  try {
    const snap = await AvailabilitySnapshotModel.create({ volunteerId })
    return snap.toObject() as AvailabilitySnapshot
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function updateSnapshotOnCallByVolunteerId(
  volunteerId: Types.ObjectId,
  availability: Availability
): Promise<void> {
  try {
    const result = await AvailabilitySnapshotModel.updateOne(
      { volunteerId },
      { onCallAvailability: availability }
    ).exec()
    if (!result.acknowledged)
      throw new RepoUpdateError('Update query was not acknowledged')
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function updateSnapshotFullByVolunteerId(
  volunteerId: Types.ObjectId,
  availability: Availability,
  timezone: string,
  modifiedAt: Date
): Promise<void> {
  try {
    const result = await AvailabilitySnapshotModel.updateOne(
      { volunteerId },
      {
        onCallAvailability: availability,
        timezone,
        modifiedAt,
      }
    ).exec()
    if (!result.acknowledged)
      throw new RepoUpdateError('Update query was not acknowledged')
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export type BaseHistory = Pick<
  AvailabilityHistory,
  'availability' | 'volunteerId' | 'timezone' | 'date'
>
export async function createHistoryFromBaseHistory(
  base: BaseHistory
): Promise<AvailabilityHistory> {
  try {
    const history = await AvailabilityHistoryModel.create(base)
    return history.toObject() as AvailabilityHistory
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

// pg wrappers
import { getClient } from '../../pg'
import * as pgQueries from './pg.queries'
import { Ulid } from '../pgUtils'

import _ from 'lodash'
import moment from 'moment'
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

function buildAvailabilityModel(
  rows: pgQueries.IGetAvailabilityForVolunteerResult[]
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

export async function getAvaiabilityForVolunteer(
  userId: Ulid
): Promise<Availability> {
  try {
    const result = await pgQueries.getAvailabilityForVolunteer.run(
      { userId },
      getClient()
    )
    return buildAvailabilityModel(result)
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export interface IAvailabilityHistory {
  volunteerId: string
  recordedAt: Date
  availability: Availability
}

export async function getAvailabilityHistoryForDatesByVolunteerId(
  userId: Ulid,
  start: Date,
  end: Date
): Promise<IAvailabilityHistory[]> {
  try {
    const result = await pgQueries.getAvailabilityHistoryForDatesByVolunteerId.run(
      { userId, start, end },
      getClient()
    )
    const rowsByDate = _.groupBy(result, 'recordedAt')

    const histories: IAvailabilityHistory[] = []
    for (const [date, rows] of Object.entries(rowsByDate).sort((a, b) =>
      new Date(a[0]) > new Date(b[0]) ? 1 : -1
    )) {
      const availability = buildAvailabilityModel(rows)
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

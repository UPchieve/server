import { Types } from 'mongoose'
import AvailabilitySnapshotModel, { AvailabilitySnapshot } from './Snapshot'
import AvailabilityHistoryModel, { AvailabilityHistory } from './History'
import { Availability } from './types'
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

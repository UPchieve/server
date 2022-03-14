import { Aggregate, Types } from 'mongoose'
import NotificationModel, { Notification } from './index'
import * as SessionRepo from '../Session/queries'
import { RepoReadError } from '../Errors'

export async function getNotificationsByVolunteerId(
  id: Types.ObjectId
): Promise<Notification[]> {
  try {
    return NotificationModel.find({ volunteer: id })
      .lean()
      .exec()
  } catch (err) {
    throw new RepoReadError(err)
  }
}

/**
 * This function is only used by the session service to populate notifications in
 * the amdin session view. The admin view only needs tehe volunteer firstname
 * and volunteer partner org but we sent the entire volunteer object
 */
export async function getSessionNotificationsWithSessionId(
  sessionId: Types.ObjectId
): Promise<Notification[]> {
  try {
    const session = await SessionRepo.getSessionById(sessionId)
    return NotificationModel.aggregate([
      {
        $match: {
          $expr: {
            $in: ['$_id', session.notifications],
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'volunteer',
          foreignField: '_id',
          as: 'volunteer',
        },
      },
      { $unwind: '$volunteer' },
    ]).exec()
  } catch (err) {
    if (err instanceof RepoReadError) throw err
    throw new RepoReadError(err)
  }
}

// TODO: this should not be used - if you need an agg write a custom getter function
export const getNotificationsWithPipeline = (
  pipeline: any
): Aggregate<Notification[]> =>
  NotificationModel.aggregate(pipeline).read('secondaryPreferred')

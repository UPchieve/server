import { Aggregate, Types } from 'mongoose'
import NotificationModel, { Notification } from './index'
import * as SessionRepo from '../Session/queries'

export async function getNotificationsByVolunteerId(id: Types.ObjectId): Promise<Notification[]> {
  return NotificationModel.find({ volunteer: id })
    .select({})
    .lean()
    .exec()
}

export async function getNotificationWithVolunteer(
  notificationId: Types.ObjectId
): Promise<Notification> {
  const [notification] = await NotificationModel.aggregate([
    {
      $match: {
        _id: notificationId,
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
  ])

  return notification
}

export async function getSessionNotificationsWithSessionId(
  sessionId: Types.ObjectId
): Promise<Notification[]> {
  const session = await SessionRepo.getSessionById(sessionId)
  return NotificationModel.aggregate([
    {
      $match: {
        $expr: {
          $in: ['$_id', session.notifications]
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'volunteer',
        foreignField: '_id',
        as: 'volunteer'
      }
    },
    { $unwind: '$volunteer' }
  ]).exec()
}

export const getNotificationsWithPipeline = (
  pipeline: any
): Aggregate<Notification[]> =>
  NotificationModel.aggregate(pipeline).read('secondaryPreferred')

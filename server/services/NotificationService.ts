import { Aggregate } from 'mongoose'
import NotificationModel, { Notification } from '../models/Notification'
import * as SessionService from './SessionService'
import { Types } from 'mongoose'

export const getNotification = async (
  query: Partial<Notification>,
  projection = {}
): Promise<Notification|undefined> => {
  const result = await NotificationModel.findOne(query)
    .select(projection)
    .lean()
    .exec()
  if (result) {
    return result as Notification
  }
}

export const getNotifications = (
  query: Partial<Notification>,
  projection = {}
): Promise<Notification[]> => {
  return NotificationModel.find(query)
    .select(projection)
    .lean()
    .exec()
}

export const getNotificationsWithPipeline = (
  pipeline: any
): Aggregate<Notification[]> =>
  NotificationModel.aggregate(pipeline).read('secondaryPreferred')

export const getNotificationWithVolunteer = async (
  notificationId: Types.ObjectId
): Promise<Notification> => {
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

export const getSessionNotifications = async (
  sessionId: Types.ObjectId
): Promise<Notification[]> => {
  const session = await SessionService.getSessionById(sessionId)
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
}

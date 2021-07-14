import { Aggregate } from 'mongoose'
import NotificationModel, { Notification } from '../models/Notification'
import * as SessionService from './SessionService'

export const getNotification = (
  query,
  projection = {}
): Promise<Notification> => {
  return NotificationModel.findOne(query)
    .select(projection)
    .lean()
    .exec()
}

export const getNotifications = (
  query,
  projection = {}
): Promise<Notification[]> => {
  return NotificationModel.find(query)
    .select(projection)
    .lean()
    .exec()
}

export const getNotificationsWithPipeline = (
  pipeline
): Aggregate<Notification[]> =>
  NotificationModel.aggregate(pipeline).read('secondaryPreferred')

export const getNotificationWithVolunteer = async (
  notificationId
): Promise<Notification> => {
  const [notification] = await NotificationModel.aggregate([
    {
      $match: {
        _id: notificationId
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
  ])

  return notification
}

export const getSessionNotifications = async (
  sessionId
): Promise<Notification[]> => {
  const session = await SessionService.getSessionById(sessionId)
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

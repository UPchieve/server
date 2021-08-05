import {Aggregate, Types} from 'mongoose'
import NotificationModel, { NotificationDocument } from '../models/Notification'
import * as SessionService from './SessionService'
import { DocumentDefinition } from 'mongoose'

export const getNotification = (
  query: {},
  projection = {}
): Promise<DocumentDefinition<NotificationDocument> | null> => {
  return NotificationModel.findOne(query)
    .select(projection)
    .lean()
    .exec()
}

export const getNotifications = (
  query: {},
  projection: {} = {}
): Promise<Notification[]|null> => {
  return NotificationModel.find(query)
    .select(projection)
    .lean()
    .exec()
}

export const getNotificationsWithPipeline = (
  pipeline
): Aggregate<Notification[]|null> =>
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

export async function getSessionNotifications(
  sessionId: Types.ObjectId
): Promise<Notification[]> {
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

import { Aggregate, Types } from 'mongoose'
import NotificationModel, { Notification } from './index'

export async function getNotificationsByVolunteerId(id: Types.ObjectId): Promise<Notification[]> {
  return NotificationModel.find({ volunteer: id })
    .select({})
    .lean()
    .exec()
}

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

export const getNotificationsWithPipeline = (
  pipeline: any
): Aggregate<Notification[]> =>
  NotificationModel.aggregate(pipeline).read('secondaryPreferred')
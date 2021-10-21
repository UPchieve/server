import { Types } from 'mongoose'
import PushTokenModel, { PushToken } from './index'
import { RepoReadError } from '../Errors'

export async function getPushTokensByUserId(userId: Types.ObjectId): Promise<PushToken[]> {
  try {
    return await PushTokenModel.find({ user: userId })
      .lean()
      .exec()
  } catch (err) {
    throw new RepoReadError(err)
  }
}

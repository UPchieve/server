import { Types } from 'mongoose'
import PushTokenModel, { PushToken } from './index'
import { RepoReadError, RepoCreateError } from '../Errors'

export async function getPushTokensByUserId(
  userId: Types.ObjectId
): Promise<PushToken[]> {
  try {
    return await PushTokenModel.find({ user: userId })
      .lean()
      .exec()
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function createPushTokenByUserIdToken(
  userId: Types.ObjectId,
  token: string
): Promise<PushToken> {
  try {
    const data = await PushTokenModel.create({
      user: userId,
      token,
    })
    if (data) return data.toObject() as PushToken
    else throw new RepoCreateError('Create query did not return created object')
  } catch (err) {
    if (err instanceof RepoCreateError) throw err
    throw new RepoCreateError(err)
  }
}

import { Types } from 'mongoose'
import UserModel from '../../models/User'

export async function validUser(
  userId: Types.ObjectId
): Promise<boolean> {
  // TODO: should this go through the repo?
  const user = await UserModel.findById(userId)
    .lean()
    .exec()
  if (!user) return false
  return true
}

export function getIdFromModelReference<M extends { _id: Types.ObjectId }>(modelOrId: M | Types.ObjectId): Types.ObjectId {
  if (modelOrId instanceof Types.ObjectId) {
    return modelOrId as Types.ObjectId
  } else {
    return (modelOrId as M)._id
  }
}

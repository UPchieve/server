import { Types } from 'mongoose'
import UserModel from '../../models/User'
export * from './manifests'

export async function validUser(userId: Types.ObjectId): Promise<boolean> {
  // TODO: should this go through the repo?
  const user = await UserModel.findById(userId)
    .lean()
    .exec()
  if (!user) return false
  return true
}

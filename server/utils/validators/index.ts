import { Types } from 'mongoose'
import UserModel from '../../models/User'
export * from './manifests'

export async function validUser(userId: Types.ObjectId): Promise<boolean> {
  // replaced by get user contact info by ID
  const user = await UserModel.findById(userId)
    .lean()
    .exec()
  if (!user) return false
  return true
}

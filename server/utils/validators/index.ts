import { Types } from 'mongoose'
import UserModel from '../../models/User'

export async function validUser(
  userId: Types.ObjectId | string
): Promise<boolean> {
  const user = await UserModel.findById(userId)
    .lean()
    .exec()
  if (!user) return false
  return true
}

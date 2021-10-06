import UserModel from '../../models/User'
import { Types } from 'mongoose'

export async function validUser(
  userId: Types.ObjectId | string
): Promise<boolean> {
  const user = await UserModel.findById(userId)
    .lean()
    .exec()
  if (!user) return false
  return true
}

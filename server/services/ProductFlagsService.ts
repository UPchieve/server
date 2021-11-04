import { Types } from 'mongoose'
import * as UserProductFlagsRepo from '../models/UserProductFlags/queries'

export async function getPublicUPFByUserId(userId: Types.ObjectId) {
  return UserProductFlagsRepo.getPublicUPFByUserId(userId)
}

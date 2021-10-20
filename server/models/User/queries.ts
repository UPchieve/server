import mongoose from 'mongoose'
import UserModel, { User } from './index'
import {
  RepoDeleteError,
  RepoReadError
} from '../Errors'

export async function deleteUserByEmail(userEmail: string): Promise<void> {
  try {
    const result = await UserModel.deleteOne({ email: userEmail }).exec()
    if (!result.deletedCount)
      throw new RepoDeleteError('Deletion operation returned 0 deleted documents')
  } catch (err) {
    if (err instanceof RepoDeleteError)
      throw err
    else
      throw new RepoDeleteError(err)
  }
}

export async function findUserIdByReferralCode(referralCode: string): Promise<mongoose.Types.ObjectId | undefined> {
  try {
    const user = await UserModel.findOne({ referralCode }, { _id: 1 }).lean().exec()
    if (user)
      return user._id
  } catch (err) {
    throw new RepoReadError(err)
  }
}


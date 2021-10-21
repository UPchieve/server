import { Types } from 'mongoose'
import UserModel, { User } from './index'
import {
  RepoDeleteError,
  RepoReadError,
  RepoUpdateError
} from '../Errors'

export async function findUserIdByPhone(phone: string): Promise<Types.ObjectId | undefined> {
  try {
    const user = await UserModel.findOne({ phone }, { _id: 1 }).lean().exec()
    if (user)
      return user._id
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function findUserIdByEmail(email: string): Promise<Types.ObjectId | undefined> {
  try {
    const user = await UserModel.findOne({ email }, { _id: 1 }).lean().exec()
    if (user)
      return user._id
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function findUserIdByReferralCode(referralCode: string): Promise<Types.ObjectId | undefined> {
  try {
    const user = await UserModel.findOne({ referralCode }, { _id: 1 }).lean().exec()
    if (user)
      return user._id
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function findUserById(userId: Types.ObjectId | string): Promise<User | undefined> {
  try {
    const user = await UserModel.findOne({ _id: userId }).lean().exec()
    if (user) return user as User
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  try {
    const user = await UserModel.findOne({ email: email }).lean().exec()
    if (user) return user as User
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function findUserByResetToken(token: string): Promise<User | undefined> {
  try {
    const user = await UserModel.findOne({ passwordResetToken: token }).lean().exec()
    if (user) return user as User
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function updateUserResetTokenById(userId: Types.ObjectId | string, token: string): Promise<void> {
  try {
    const result = await UserModel.updateOne({ _id: userId }, { passwordResetToken: token }).exec()
    if (!result.ok) throw new RepoUpdateError('Update query did not return "ok"')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function updateUserPasswordById(userId: Types.ObjectId | string, password: string): Promise<void> {
  try {
    const result = await UserModel.updateOne({ _id: userId }, { $unset: { passwordResetToken: '' }, password }).exec()
    if (!result.ok) throw new RepoUpdateError('Update query did not return "ok"')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function updateUserIpById(userId: Types.ObjectId | string, ip: Types.ObjectId): Promise<void> {
  try {
    const result = await UserModel.updateOne({ _id: userId }, { $addToSet: { ipAddresses: userIpAddress._id } }).exec()
    if (!result.ok) throw new RepoUpdateError('Update query did not return "ok"')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

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
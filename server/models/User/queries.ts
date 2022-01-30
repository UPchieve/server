import { Types } from 'mongoose'
import UserModel, { User } from './index'
import { RepoDeleteError, RepoReadError, RepoUpdateError } from '../Errors'
import { USER_BAN_REASON } from '../../constants'

export async function getUserIdByPhone(
  phone: string
): Promise<Types.ObjectId | undefined> {
  try {
    const user = await UserModel.findOne({ phone }, { _id: 1 })
      .lean()
      .exec()
    if (user) return user._id
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getUserIdByEmail(
  email: string
): Promise<Types.ObjectId | undefined> {
  try {
    const user = await UserModel.findOne({ email }, { _id: 1 })
      .lean()
      .exec()
    if (user) return user._id
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getUserByReferralCode(
  referralCode: string
): Promise<User | undefined> {
  try {
    const user = await UserModel.findOne({ referralCode })
      .lean()
      .exec()
    if (user) return user
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getUserById(
  userId: Types.ObjectId
): Promise<User | undefined> {
  try {
    const user = await UserModel.findOne({ _id: userId })
      .lean()
      .exec()
    if (user) return user as User
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getUserForPassport(
  email: string
): Promise<User | undefined> {
  try {
    const user = await UserModel.findOne({ email: email }, '+password')
      .lean()
      .exec()
    if (user) return user as User
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  try {
    const user = await UserModel.findOne({ email: email })
      .lean()
      .exec()
    if (user) return user as User
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getUserByResetToken(
  token: string
): Promise<User | undefined> {
  try {
    const user = await UserModel.findOne({ passwordResetToken: token })
      .lean()
      .exec()
    if (user) return user as User
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getUsersReferredByOtherId(
  otherId: Types.ObjectId
): Promise<User[]> {
  try {
    return UserModel.find({ referredBy: otherId, verified: true })
      .lean()
      .exec()
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function updateUserResetTokenById(
  userId: Types.ObjectId,
  token: string
): Promise<void> {
  try {
    const result = await UserModel.updateOne(
      { _id: userId },
      { passwordResetToken: token }
    ).exec()
    if (!result.acknowledged)
      throw new RepoUpdateError('Update query was not acknowledged')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function updateUserPasswordById(
  userId: Types.ObjectId,
  password: string
): Promise<void> {
  try {
    const result = await UserModel.updateOne(
      { _id: userId },
      { $unset: { passwordResetToken: '' }, password }
    ).exec()
    if (!result.acknowledged)
      throw new RepoUpdateError('Update query was not acknowledged')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function updateUserIpById(
  userId: Types.ObjectId,
  ipId: Types.ObjectId
): Promise<void> {
  try {
    const result = await UserModel.updateOne(
      { _id: userId },
      { $addToSet: { ipAddresses: ipId } }
    ).exec()
    if (!result.acknowledged)
      throw new RepoUpdateError('Update query was not acknowledged')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function updateUserVerifiedInfoById(
  userId: Types.ObjectId,
  sendTo: string,
  isPhoneVerification: boolean
): Promise<void> {
  const update: {
    verified: boolean
    phone?: string
    verifiedPhone?: boolean
    email?: string
    verifiedEmail?: boolean
  } = { verified: true }
  if (isPhoneVerification) {
    update.verifiedPhone = true
    update.phone = sendTo
  } else {
    update.verifiedEmail = true
    update.email = sendTo
  }
  try {
    const result = await UserModel.updateOne({ _id: userId }, update).exec()
    if (!result.acknowledged)
      throw new RepoUpdateError('Update query was not acknowledged')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function addUserPastSessionById(
  userId: Types.ObjectId,
  sessionId: Types.ObjectId
): Promise<void> {
  try {
    const result = await UserModel.updateOne(
      { _id: userId },
      { $addToSet: { pastSessions: sessionId } }
    )
    if (!result.acknowledged)
      throw new RepoUpdateError('Update query was not acknowledged')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function updateUserLastActivityById(
  userId: Types.ObjectId,
  lastActivityAt: Date
) {
  try {
    const result = await UserModel.updateOne(
      { _id: userId },
      { lastActivityAt }
    )
    if (!result.acknowledged)
      throw new RepoUpdateError('Update query was not acknowledged')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function banUserById(
  userId: Types.ObjectId,
  banReason: USER_BAN_REASON
) {
  try {
    const result = await UserModel.updateOne(
      { _id: userId },
      { $set: { isBanned: true, banReason } }
    ).exec()
    if (!result.acknowledged)
      throw new RepoUpdateError('Update query was not acknowledged')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function deleteUserByEmail(userEmail: string): Promise<void> {
  try {
    const result = await UserModel.deleteOne({ email: userEmail }).exec()
    if (!result.deletedCount)
      throw new RepoDeleteError(
        'Deletion operation returned 0 deleted documents'
      )
  } catch (err) {
    if (err instanceof RepoDeleteError) throw err
    else throw new RepoDeleteError(err)
  }
}

// pg wrappers
import client from '../../pg'
import * as pgQueries from './pg.queries'
import { Ulid } from '../pgUtils'

export async function IgetUserIdByEmail(
  email: string
): Promise<Ulid | undefined> {
  try {
    const result = await pgQueries.getUserIdByEmail.run({ email }, client)
    if (result.length) return result[0].id
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type UserContactInfo = {
  id: Ulid
  email: string
  phone?: string
  firstName: string
}

export async function IgetUserContactInfoById(
  id: Ulid
): Promise<UserContactInfo | undefined> {
  try {
    const result = await pgQueries.getUserContactInfoById.run({ id }, client)
    if (result.length) return result[0]
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function IgetUserContactInfoByReferralCode(
  referralCode: string
): Promise<UserContactInfo | undefined> {
  try {
    const result = await pgQueries.getUserContactInfoByReferralCode.run(
      { referralCode },
      client
    )
    if (result.length) return result[0]
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function IgetUserContactInfoByResetToken(
  resetToken: string
): Promise<UserContactInfo | undefined> {
  try {
    const result = await pgQueries.getUserContactInfoByResetToken.run(
      { resetToken },
      client
    )
    if (result.length) return result[0]
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function countUsersReferredByOtherId(
  userId: Ulid
): Promise<number> {
  try {
    const result = await pgQueries.countUsersReferredByOtherId.run(
      { userId },
      client
    )
    if (result.length && result[0].total) return result[0].total
    return 0
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function IupdateUserResetTokenById(
  token: string,
  userId: Ulid
): Promise<void> {
  try {
    const result = await pgQueries.updateUserResetTokenById.run(
      { token, userId },
      client
    )
    if (result.length && result[0].id) return
    throw new RepoUpdateError('Update query did not return updated id')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

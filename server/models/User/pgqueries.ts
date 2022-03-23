import { getClient } from '../../pg'
import * as pgQueries from './pg.queries'
import { makeRequired, makeSomeRequired, Ulid, Pgid, getDbUlid } from '../pgUtils'
import { RepoReadError, RepoUpdateError } from '../Errors'
import { USER_BAN_REASONS } from '../../constants'

export async function getUserIdByPhone(
  phone: string
): Promise<Ulid | undefined> {
  try {
    const result = await pgQueries.getUserIdByPhone.run({ phone }, getClient())
    if (result.length) return makeRequired(result[0]).id
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getUserIdByEmail(
  email: string
): Promise<Ulid | undefined> {
  try {
    const result = await pgQueries.getUserIdByEmail.run({ email }, getClient())
    if (result.length) return makeRequired(result[0]).id
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type UserContactInfo = {
  id: Ulid
  email: string
  phone?: string
  firstName: string
  isVolunteer: boolean,
  volunteerPartnerOrg?: string
}

export async function getUserContactInfoById(
  id: Ulid
): Promise<UserContactInfo | undefined> {
  try {
    const result = await pgQueries.getUserContactInfoById.run(
      { id },
      getClient()
    )
    if (result.length) return makeSomeRequired(result[0], ['volunteerPartnerOrg'])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

// getUserByReferralCode
export async function getUserContactInfoByReferralCode(
  referralCode: string
): Promise<UserContactInfo | undefined> {
  try {
    const result = await pgQueries.getUserContactInfoByReferralCode.run(
      { referralCode },
      getClient()
    )
    if (result.length) return makeSomeRequired(result[0], ['volunteerPartnerOrg'])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type PassportUser = {
  id: Ulid
  email: string
  password: string
}

export async function getUserForPassport(
  email: string
): Promise<PassportUser | undefined> {
  try {
    const result = await pgQueries.getUserForPassport.run(
      { email },
      getClient()
    )
    if (result.length) return makeRequired(result[0])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

// getUserByResetToken
export async function getUserContactInfoByResetToken(
  resetToken: string
): Promise<UserContactInfo | undefined> {
  try {
    const result = await pgQueries.getUserContactInfoByResetToken.run(
      { resetToken },
      getClient()
    )
    if (result.length) return makeSomeRequired(result[0], ['volunteerPartnerOrg'])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

// getUsersReferredByOtherId
export async function countUsersReferredByOtherId(
  userId: Ulid
): Promise<number> {
  try {
    const result = await pgQueries.countUsersReferredByOtherId.run(
      { userId },
      getClient()
    )
    if (result.length && result[0].total) return makeRequired(result[0]).total
    return 0
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function updateUserResetTokenById(
  token: string,
  userId: Ulid
): Promise<void> {
  try {
    const result = await pgQueries.updateUserResetTokenById.run(
      { token, userId },
      getClient()
    )
    if (result.length && result[0].id) return
    throw new RepoUpdateError('Update query did not return updated id')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function updateUserPasswordById(
  userId: Ulid,
  password: string
): Promise<void> {
  try {
    const result = await pgQueries.updateUserPasswordById.run(
      { userId, password },
      getClient()
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new RepoUpdateError('Update query did not return ok')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

// updateUserIpById
export async function insertUserIpById(
  userId: Ulid,
  ipId: Pgid
): Promise<void> {
  try {
    const result = await pgQueries.insertUserIpById.run(
      { id: getDbUlid(), userId, ipId },
      getClient()
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new RepoUpdateError('Insert query did not return ok')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function updateUserVerifiedInfoById(
  userId: Ulid,
  sendTo: string,
  isPhoneVerification: boolean
): Promise<void> {
  const update = isPhoneVerification
    ? pgQueries.updateUserVerifiedPhoneById.run(
        { userId, phone: sendTo },
        getClient()
      )
    : pgQueries.updateUserVerifiedEmailById.run(
        { userId, email: sendTo },
        getClient()
      )
  try {
    const result = await update
    if (!(result.length && makeRequired(result[0]).ok))
      throw new RepoUpdateError('Update query did not return ok')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function updateUserLastActivityById(
  userId: Ulid,
  lastActivityAt: Date
) {
  try {
    const result = await pgQueries.updateUserLastActivityById.run(
      { userId, lastActivityAt },
      getClient()
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new RepoUpdateError('Update query did not return ok')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function banUserById(userId: Ulid, banReason: USER_BAN_REASONS) {
  try {
    const result = await pgQueries.updateUserBanById.run(
      { userId, banReason },
      getClient()
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new RepoUpdateError('Update query did not return ok')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

type UserQuery = {
  userId: string | undefined
  firstName: string | undefined
  lastName: string | undefined
  email: string | undefined
  partnerOrg: string | undefined
  highSchool: string | undefined
}
type AdminUser = {
  id: Ulid,
  firstName: string,
  lastName: string,
  email: string,
  isVolunteer: boolean,
  createdAt: Date
}

export async function getUsersForAdminSearch(payload: UserQuery, limit: number, offset: number): Promise<AdminUser[]> {
  try {
    const result = await pgQueries.getUsersForAdminSearch.run(
      { ...payload, limit, offset },
      getClient()
    )
    return result.map(v => makeRequired(v))
  } catch (err) {
    throw new RepoReadError(err)
  }
}
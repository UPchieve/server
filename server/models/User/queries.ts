import { getClient } from '../../pg'
import * as pgQueries from './pg.queries'
import {
  makeRequired,
  makeSomeRequired,
  makeSomeOptional,
  Ulid,
  Pgid,
  getDbUlid,
} from '../pgUtils'
import { RepoReadError, RepoUpdateError } from '../Errors'
import { USER_BAN_REASONS } from '../../constants'
import { getReferencesByVolunteer } from '../Volunteer/queries'
import { PoolClient } from 'pg'

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

export async function deleteUser(userId: Ulid, email: string) {
  try {
    const result = await pgQueries.deleteUser.run(
      { userId: userId, email },
      getClient()
    )
    if (result.length && makeRequired(result[0].ok)) return
    throw new RepoUpdateError('Update query did not delete student')
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export type UserContactInfo = {
  id: Ulid
  email: string
  phone?: string
  firstName: string
  isVolunteer: boolean
  isAdmin: boolean
  volunteerPartnerOrg?: string
  studentPartnerOrg?: string
  lastActivityAt?: Date,
  banned: boolean,
  deactivated: boolean,
  approved?: boolean
}

export async function getUserContactInfoById(
  id: Ulid
): Promise<UserContactInfo | undefined> {
  try {
    const result = await pgQueries.getUserContactInfoById.run(
      { id },
      getClient()
    )
    if (result.length)
      return makeSomeRequired(result[0], ['volunteerPartnerOrg', 'studentPartnerOrg', 'approved', 'lastActivityAt'])
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
    if (result.length)
      return makeSomeRequired(result[0], ['volunteerPartnerOrg', 'studentPartnerOrg', 'approved', 'lastActivityAt'])
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
    if (result.length)
      return makeSomeRequired(result[0], ['volunteerPartnerOrg', 'studentPartnerOrg', 'approved', 'lastActivityAt'])
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
  id: Ulid
  _id: Ulid
  firstName: string
  lastName: string
  email: string
  isVolunteer: boolean
  createdAt: Date
}
function cleanPayload(payload: UserQuery): UserQuery {
  const temp: any = {}
  for (const [key, value] of Object.entries(payload)) {
    temp[key] = value === '' ? undefined : value
  }
  return temp as UserQuery
}
export async function getUsersForAdminSearch(
  payload: UserQuery,
  limit: number,
  offset: number
): Promise<AdminUser[]> {
  try {
    const result = await pgQueries.getUsersForAdminSearch.run(
      { ...cleanPayload(payload), limit, offset },
      getClient()
    )
    return result.map(v => {
      const user = makeRequired(v)
      return {
        _id: user.id,
        ...user,
      }
    })
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type PastSessionForAdmin = {
  type: string
  subTopic: string
  totalMessages: number
  volunteer?: Ulid
  student: Ulid
  volunteerJoinedAt?: Date
  createdAt: Date
  endedAt?: Date
}

export async function getPastSessionsForAdminDetail(userId: Ulid, poolClient?: PoolClient): Promise<PastSessionForAdmin[]> {
  const client = poolClient ? poolClient : getClient()
  try {
    const result = await pgQueries.getPastSessionsForAdminDetail.run({userId}, client)
    return result.map(v => makeSomeRequired(v, ['volunteer', 'volunteerJoinedAt', 'endedAt']))
  } catch (err) {
    throw new RepoReadError(err)
  }
}

// TODO: needs formal return type which is huge due to frontend
export async function getUserForAdminDetail(userId: Ulid) {
  const client = await getClient().connect()
  try {
    const userResult = await pgQueries.getUserForAdminDetail.run(
      { userId },
      client
    )
    const user = makeSomeOptional(userResult[0], [
      'id',
      'createdAt',
      'email',
      'firstname',
      'lastname',
      'isAdmin',
      'isDeactivated',
      'isTestUser',
      'isVolunteer',
      'verified',
      'numPastSessions',
    ])
    const references = await getReferencesByVolunteer(user.id, client)
    const sessions = await getPastSessionsForAdminDetail(user.id, client)
    return {
      ...user,
      references,
      pastSessions: sessions,
      _id: user.id,
    }
  } catch (err) {
    throw new RepoReadError(err)
  } finally {
    client.release()
  }
}

export type UserForCreateSendGridContact = UserContactInfo & {
  lastName: string
  banned: boolean
  testUser: boolean
  isVolunteer: boolean
  isAdmin: boolean
  deactivated: boolean
  createdAt: Date
  passedUpchieve101?: boolean
  studentPartnerOrg?: string
  volunteerPartnerOrg?: string
  studentPartnerOrgDisplay?: string
  volunteerPartnerOrgDisplay?: string
}
export async function getUserToCreateSendGridContact(userId: Ulid): Promise<UserForCreateSendGridContact> {
  try {
    const result = await pgQueries.getUserToCreateSendGridContact.run({ userId }, getClient())
    if (!result.length) throw new RepoReadError('User not found')
    return makeSomeRequired(result[0], ['studentPartnerOrg', 'volunteerPartnerOrg', 'studentPartnerOrgDisplay', 'volunteerPartnerOrgDisplay', 'passedUpchieve101', 'lastActivityAt'])
  } catch (err) {
    throw new RepoReadError(err)
  }
}
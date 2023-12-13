import { getClient, TransactionClient } from '../../db'
import * as pgQueries from './pg.queries'
import {
  makeRequired,
  makeSomeOptional,
  makeSomeRequired,
  Ulid,
  Pgid,
  getDbUlid,
  generateReferralCode,
} from '../pgUtils'
import { RepoCreateError, RepoReadError, RepoUpdateError } from '../Errors'
import { USER_BAN_REASONS, USER_ROLES_TYPE } from '../../constants'
import { getReferencesByVolunteerForAdminDetail } from '../Volunteer/queries'
import { getSubjectNameIdMapping } from '../Subjects/queries'
import { PoolClient } from 'pg'
import { CreateUserPayload, CreateUserResult, User } from './types'
import { IUpdateUserVerifiedPhoneByIdResult } from './pg.queries'

export async function createUser(
  user: CreateUserPayload,
  tc: TransactionClient
): Promise<CreateUserResult> {
  try {
    const id = getDbUlid()
    const result = await pgQueries.createUser.run(
      {
        id,
        email: user.email.toLowerCase(),
        emailVerified: user.emailVerified ?? false,
        firstName: user.firstName,
        lastName: user.lastName,
        otherSignupSource: user.otherSignupSource,
        password: user.password,
        passwordResetToken: user.passwordResetToken,
        phone: user.phone,
        phoneVerified: user.phoneVerified ?? false,
        proxyEmail: user.proxyEmail?.toLowerCase(),
        referralCode: generateReferralCode(id),
        referredBy: user.referredBy,
        signupSourceId: user.signupSourceId,
        verified: user.verified ?? false,
      },
      tc
    )
    if (!result.length) throw new RepoCreateError('createUser returned 0 rows.')
    return makeSomeOptional(result[0], ['proxyEmail'])
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

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
    const result = await pgQueries.getUserIdByEmail.run(
      { email: email.toLowerCase() },
      getClient()
    )
    if (result.length) return makeRequired(result[0]).id
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function deleteUser(userId: Ulid, email: string) {
  try {
    const result = await pgQueries.deleteUser.run(
      { userId: userId, email: email.toLowerCase() },
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
  phoneVerified: boolean
  smsConsent: boolean
  firstName: string
  isVolunteer: boolean
  isAdmin: boolean
  volunteerPartnerOrg?: string
  studentPartnerOrg?: string
  lastActivityAt?: Date
  banned: boolean
  deactivated: boolean
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
    if (result.length) {
      const ret = makeSomeOptional(result[0], [
        'volunteerPartnerOrg',
        'studentPartnerOrg',
        'approved',
        'lastActivityAt',
        'phone',
      ])
      ret.email = ret.email.toLowerCase()
      return ret
    }
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
    if (result.length) {
      const ret = makeSomeOptional(result[0], [
        'volunteerPartnerOrg',
        'studentPartnerOrg',
        'approved',
        'lastActivityAt',
        'phone',
      ])
      ret.email = ret.email.toLowerCase()
      return ret
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getUserReferralLink(
  id: Ulid
): Promise<
  { firstName: string; email: string; referralCode: string } | undefined
> {
  try {
    const result = await pgQueries.getUserReferralLink.run({ id }, getClient())
    if (result.length) {
      return makeRequired(result[0])
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type PassportUser = {
  id: Ulid
  email: string
  proxyEmail?: string
  password?: string
}

export async function getUserForPassport(
  email: string
): Promise<PassportUser | undefined> {
  try {
    const result = await pgQueries.getUserForPassport.run(
      { email: email.toLowerCase() },
      getClient()
    )
    if (result.length)
      return makeSomeOptional(result[0], ['password', 'proxyEmail'])
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
    if (result.length) {
      const ret = makeSomeOptional(result[0], [
        'volunteerPartnerOrg',
        'studentPartnerOrg',
        'approved',
        'lastActivityAt',
        'phone',
      ])
      ret.email = ret.email.toLowerCase()
      return ret
    }
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
  userId: Ulid,
  token: string
): Promise<void> {
  try {
    const result = await pgQueries.updateUserResetTokenById.run(
      { token, userId },
      getClient()
    )
    if (result.length && result[0].id) return
    throw new RepoUpdateError('Update query did not return updated id')
  } catch (err) {
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
    throw new RepoUpdateError(err)
  }
}

export async function updateUserVerifiedInfoById(
  userId: Ulid,
  sendTo: string,
  isPhoneVerification: boolean
): Promise<{ contact: string | null }> {
  const update = isPhoneVerification
    ? pgQueries.updateUserVerifiedPhoneById.run(
        { userId, phone: sendTo },
        getClient()
      )
    : pgQueries.updateUserVerifiedEmailById.run(
        { userId, email: sendTo.toLowerCase() },
        getClient()
      )
  try {
    const result = await update
    if (!(result.length && makeRequired(result[0]).ok))
      throw new RepoUpdateError('Update query did not return ok')

    return {
      contact: result[0].ok,
    }
  } catch (err) {
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
  lastName?: string
  email: string
  isVolunteer: boolean
  createdAt: Date
}
function cleanPayload(payload: UserQuery): UserQuery {
  const temp: any = {}
  for (const [key, value] of Object.entries(payload)) {
    temp[key] = value === '' ? undefined : value
  }
  if (payload.email) {
    temp.email = payload.email?.toLowerCase()
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
      const user = makeSomeOptional(v, ['lastName'])
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
  id: Ulid
  _id: Ulid
  type: string
  subTopic: string
  totalMessages: number
  volunteer?: Ulid
  student: Ulid
  volunteerJoinedAt?: Date
  createdAt: Date
  endedAt?: Date
}

export async function getPastSessionsForAdminDetail(
  userId: Ulid,
  limit: number,
  offset: number,
  poolClient?: PoolClient
): Promise<PastSessionForAdmin[]> {
  const client = poolClient ? poolClient : getClient()
  try {
    const result = await pgQueries.getPastSessionsForAdminDetail.run(
      { userId, limit, offset },
      client
    )
    return result.map(v => {
      const temp = makeSomeOptional(v, [
        'volunteer',
        'volunteerJoinedAt',
        'endedAt',
      ])
      return {
        ...temp,
        _id: temp.id,
      }
    })
  } catch (err) {
    throw new RepoReadError(err)
  }
}

// TODO: needs formal return type which is huge due to frontend
// TODO: this query is making a request for user data on every page transition
//        for new pastSessions to display. May be better served as a separate
//        service method for getting the user's past sessions
export async function getUserForAdminDetail(
  userId: Ulid,
  limit: number,
  offset: number
) {
  const client = await getClient().connect()
  try {
    const userResult = await pgQueries.getUserForAdminDetail.run(
      { userId },
      client
    )
    const user = makeSomeRequired(userResult[0], [
      'id',
      'createdAt',
      'email',
      'firstName',
      'isAdmin',
      'isDeactivated',
      'isTestUser',
      'isVolunteer',
      'verified',
      'numPastSessions',
    ])
    if (user.email) {
      user.email = user.email.toLowerCase()
    }
    const references = await getReferencesByVolunteerForAdminDetail(
      user.id,
      client
    )
    const sessions = await getPastSessionsForAdminDetail(
      user.id,
      limit,
      offset,
      client
    )

    const background = {
      occupation: user.occupation,
      experience: user.experience,
      languages: user.languages,
      linkedInUrl: user.linkedinUrl,
      country: user.country,
      state: user.state,
      city: user.city,
      college: user.college,
      company: user.company,
    }

    return {
      ...user,
      references: references.map(ref => ({
        ...ref,
        _id: ref.id,
        status: ref.status.toUpperCase(),
      })),
      pastSessions: sessions.sort((a, b) =>
        a.createdAt > b.createdAt ? 1 : -1
      ),
      _id: user.id,
      photoIdStatus: user.photoIdStatus?.toUpperCase(),
      background,
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
  studentGradeLevel?: string
}
export async function getUserToCreateSendGridContact(
  userId: Ulid
): Promise<UserForCreateSendGridContact> {
  try {
    const result = await pgQueries.getUserToCreateSendGridContact.run(
      { userId },
      getClient()
    )
    if (!result.length) throw new RepoReadError('User not found')
    return makeSomeOptional(result[0], [
      'studentPartnerOrg',
      'volunteerPartnerOrg',
      'studentPartnerOrgDisplay',
      'volunteerPartnerOrgDisplay',
      'passedUpchieve101',
      'lastActivityAt',
      'studentGradeLevel',
    ])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getTotalSessionsByUserId(userId: Ulid): Promise<number> {
  try {
    const result = await pgQueries.getTotalSessionsByUserId.run(
      { userId },
      getClient()
    )
    if (result.length) return makeRequired(result[0]).total
    return 0
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function insertUserRoleByUserId(
  userId: Ulid,
  roleName: USER_ROLES_TYPE,
  tc?: TransactionClient
): Promise<void> {
  try {
    const result = await pgQueries.insertUserRoleByUserId.run(
      { userId, roleName },
      tc ?? getClient()
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new RepoUpdateError('Insert query did not return ok')
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function updateUserPhoneNumberByUserId(
  userId: Ulid,
  phone: string,
  tc?: TransactionClient
): Promise<void> {
  try {
    const result = await pgQueries.updateUserPhoneNumberByUserId.run(
      { userId, phone },
      tc ?? getClient()
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new RepoUpdateError('Insert query did not return ok')
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function updateUserProfileById(
  userId: Ulid,
  data: Partial<User>
): Promise<void> {
  try {
    const result = await pgQueries.updateUserProfileById.run(
      {
        userId,
        deactivated: data.deactivated,
        phone: data.phone,
        smsConsent: data.smsConsent,
      },
      getClient()
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new RepoUpdateError('Update query did not return ok')
    // Update muted subject alerts for volunteers
    if (data.mutedSubjectAlerts) {
      if (data.mutedSubjectAlerts.length == 0) {
        await pgQueries.deleteAllUserSubjectAlerts.run({ userId }, getClient())
      } else {
        let subjectNameIdMapping: {
          [name: string]: number
        } = await getSubjectNameIdMapping()
        let mutedSubjectAlertIds = []
        for (const subjectName of data.mutedSubjectAlerts) {
          mutedSubjectAlertIds.push(subjectNameIdMapping[subjectName])
        }
        let mutedSubjectAlertIdsWithUserId: {
          userId: Ulid
          subjectId: number
        }[] = []
        mutedSubjectAlertIds.forEach(subjectId =>
          mutedSubjectAlertIdsWithUserId.push({ userId, subjectId })
        )
        await pgQueries.insertMutedUserSubjectAlerts.run(
          { mutedSubjectAlertIdsWithUserId },
          getClient()
        )
        await pgQueries.deleteUnmutedUserSubjectAlerts.run(
          { userId, mutedSubjectAlertIds },
          getClient()
        )
      }
    }
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export type UserVerificationInfo = {
  verified: boolean
  emailVerified: boolean
  phoneVerified: boolean
}

export async function getUserVerificationInfoById(
  userId: Ulid
): Promise<UserVerificationInfo | undefined> {
  try {
    const result = await pgQueries.getUserVerificationInfoById.run(
      { userId },
      getClient()
    )
    if (result.length) return makeRequired(result[0])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type ReportedUser = {
  id: Ulid
  firstName: string
  lastName: string
  email: string
  createdAt: Date
  isTestUser: boolean
  isBanned: boolean
  isDeactivated: boolean
  isVolunteer: boolean
  studentPartnerOrg?: string
  volunteerPartnerOrg?: string
}

export async function getReportedUser(
  userId: Ulid
): Promise<ReportedUser | undefined> {
  try {
    const result = await pgQueries.getReportedUser.run(
      {
        userId,
      },
      getClient()
    )
    if (result.length) {
      const ret = makeSomeOptional(result[0], [
        'studentPartnerOrg',
        'volunteerPartnerOrg',
      ])
      ret.email = ret.email.toLowerCase()
      return ret
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

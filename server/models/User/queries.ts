import logger from '../../logger'
import { getClient, getRoClient, TransactionClient } from '../../db'
import * as pgQueries from './pg.queries'
import {
  makeRequired,
  makeSomeOptional,
  makeSomeRequired,
  Ulid,
  getDbUlid,
  Uuid,
  generateReferralCode,
} from '../pgUtils'
import {
  RepoCreateError,
  RepoReadError,
  RepoUpdateError,
  RepoUpsertError,
} from '../Errors'
import {
  USER_BAN_REASONS,
  USER_BAN_TYPES,
  USER_ROLES_TYPE,
} from '../../constants'
import { getReferencesByVolunteerForAdminDetail } from '../Volunteer/queries'
import { getSubjectNameIdMapping } from '../Subjects/queries'
import {
  CreateUserPayload,
  CreateUserResult,
  ReportedUser,
  UpsertUserResult,
  UserRole,
  UserContactInfo,
  UserForCreateSendGridContact,
  UserForAdmin,
  EditUserProfilePayload,
} from './types'
import { IDeletePhoneResult } from './pg.queries'

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
        smsConsent: user.smsConsent ?? false,
      },
      tc
    )
    if (!result.length) throw new RepoCreateError('createUser returned 0 rows.')
    return makeSomeOptional(result[0], ['proxyEmail'])
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function upsertUser(
  user: CreateUserPayload,
  tc: TransactionClient
): Promise<UpsertUserResult> {
  try {
    const id = getDbUlid()
    const result = await pgQueries.upsertUser.run(
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
        signupSourceId: user.signupSourceId,
        verified: user.verified ?? false,
      },
      tc
    )
    if (!result.length) throw new RepoUpsertError('upsertUser returned 0 rows.')
    return makeSomeOptional(result[0], ['proxyEmail'])
  } catch (err) {
    throw new RepoUpsertError(err)
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

export async function getUserVerificationByEmail(email: string) {
  try {
    const result = await pgQueries.getUserVerificationByEmail.run(
      { email: email.toLowerCase() },
      getClient()
    )
    if (result.length) return makeRequired(result[0])
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

export async function getUserRolesById(
  id: Ulid,
  tc: TransactionClient
): Promise<UserRole[]> {
  try {
    const result = await pgQueries.getUserRolesById.run({ id }, tc)
    return result
      .filter((row) => !!row.name)
      .map((row) => makeRequired(row).name as UserRole)
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getUserById(
  id: Ulid,
  filters: {
    includeDeactivated: boolean
  },
  tc: TransactionClient = getClient()
): Promise<Omit<UserContactInfo, 'roleContext'> | undefined> {
  try {
    const result = await pgQueries.getUserById.run(
      { id, deactivated: filters.includeDeactivated ? null : false },
      tc
    )
    if (result.length) {
      const ret = makeSomeOptional(result[0], [
        'volunteerPartnerOrg',
        'studentPartnerOrg',
        'approved',
        'lastActivityAt',
        'phone',
        'banType',
        'roles',
        'proxyEmail',
      ])
      ret.email = ret.email.toLowerCase()
      const roles = (ret.roles ?? []).filter((r) => !!r)
      if (!roles.length) {
        logger.error(`User with id ${ret.id} has no user roles.`)
      }
      return { ...ret, roles: roles as UserRole[] }
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getUserBanStatus(userId: Ulid) {
  const result = await pgQueries.getUserBanStatus.run(
    { id: userId },
    getClient()
  )
  if (result.length) {
    return makeSomeOptional(result[0], ['banType'])
  }
}

export async function getUserByReferralCode(
  referralCode: string,
  tc: TransactionClient = getClient()
): Promise<{ id: Ulid; firstName: string } | undefined> {
  try {
    const result = await pgQueries.getUserByReferralCode.run(
      { referralCode },
      tc
    )
    if (result.length) {
      return makeRequired(result[0])
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getUserReferralLink(
  id: Ulid,
  tc?: TransactionClient
): Promise<
  { firstName: string; email: string; referralCode: string } | undefined
> {
  try {
    const result = await pgQueries.getUserReferralLink.run(
      { id },
      tc ?? getClient()
    )
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

export async function getUserByResetToken(
  resetToken: string
): Promise<{ id: Ulid; email: string } | undefined> {
  try {
    const result = await pgQueries.getUserByResetToken.run(
      { resetToken },
      getClient()
    )
    if (result.length > 1) {
      throw new RepoReadError('More than one user with reset token.')
    }
    if (result.length) {
      return makeRequired(result[0])
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function countReferredUsers(
  referrerId: Ulid,
  filters?: {
    withPhoneOrEmailVerifiedAs?: boolean
    withRoles?: UserRole[]
  }
): Promise<number> {
  try {
    const result = await pgQueries.countReferredUsersWithFilter.run(
      {
        userId: referrerId,
        phoneOrEmailVerified: filters?.withPhoneOrEmailVerifiedAs ?? null,
        hasRoles: filters?.withRoles ?? null,
      },
      getRoClient()
    )
    result.map((row) => makeRequired(row))
    return result.length
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

export async function banUserById(
  userId: Ulid,
  banType: USER_BAN_TYPES,
  banReason: USER_BAN_REASONS,
  tc: TransactionClient = getClient()
) {
  try {
    const result = await pgQueries.updateUserBanById.run(
      { userId, banType, banReason },
      tc
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
  school: string | undefined
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
): Promise<Omit<UserForAdmin, 'userType'>[]> {
  try {
    const client = getClient()
    const result = await pgQueries.getUsersForAdminSearch.run(
      { ...cleanPayload(payload), limit, offset },
      client
    )
    return result.map((v) => {
      const user = makeSomeOptional(v, ['lastName'])
      return user
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
  client: TransactionClient
): Promise<PastSessionForAdmin[]> {
  try {
    const result = await pgQueries.getPastSessionsForAdminDetail.run(
      { userId, limit, offset },
      getClient()
    )
    return result.map((v) => {
      const temp = makeSomeOptional(v, [
        'volunteer',
        'volunteerFirstName',
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
  offset: number,
  client: TransactionClient = getClient()
) {
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
      'isDeleted',
      'isTestUser',
      'verified',
      'numPastSessions',
    ])
    if (user.email) {
      user.email = user.email.toLowerCase()
    }
    // TODO: Move to service method.
    const references = await getReferencesByVolunteerForAdminDetail(user.id)
    let sessions
    if (limit) {
      sessions = await getPastSessionsForAdminDetail(
        user.id,
        limit,
        offset,
        client
      )
    }

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
      references: references.map((ref) => ({
        ...ref,
        status: ref.status.toUpperCase(),
      })),
      pastSessions: sessions?.sort((a, b) =>
        a.createdAt > b.createdAt ? 1 : -1
      ),
      photoIdStatus: user.photoIdStatus?.toUpperCase(),
      background,
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getUserToCreateSendGridContact(
  userId: Ulid
): Promise<UserForCreateSendGridContact | undefined> {
  try {
    const result = await pgQueries.getUserToCreateSendGridContact.run(
      { userId },
      getClient()
    )
    if (result.length) {
      return makeSomeOptional(result[0], [
        'banType',
        'lastActivityAt',
        'passedUpchieve101',
        'studentGradeLevel',
        'studentPartnerOrg',
        'studentPartnerOrgDisplay',
        'volunteerPartnerOrg',
        'volunteerPartnerOrgDisplay',
      ])
    }
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
  userId: string,
  data: Pick<
    EditUserProfilePayload,
    | 'deactivated'
    | 'phone'
    | 'smsConsent'
    | 'preferredLanguage'
    | 'signupSourceId'
    | 'otherSignupSource'
  >,
  tc?: TransactionClient
): Promise<void> {
  try {
    await pgQueries.updateUserProfileById.run(
      {
        userId,
        deactivated: data.deactivated,
        phone: data.phone,
        smsConsent: data.smsConsent,
        preferredLanguage: data.preferredLanguage,
        signupSourceId: data.signupSourceId,
        otherSignupSource: data.otherSignupSource,
      },
      tc ?? getClient()
    )
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function updateSmsConsentForPhoneNumber(
  phoneNumber: string,
  smsConsent: boolean,
  tc = getClient()
) {
  try {
    await pgQueries.updateSmsConsentForPhoneNumber.run(
      {
        phoneNumber,
        smsConsent,
      },
      tc
    )
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function updateSubjectAlerts(
  userId: string,
  mutedSubjectAlerts: string[] | undefined,
  tc: TransactionClient
) {
  try {
    await pgQueries.deleteAllUserSubjectAlerts.run({ userId }, tc)

    if (mutedSubjectAlerts?.length) {
      const subjectNameIdMapping: {
        [name: string]: number
      } = await getSubjectNameIdMapping()

      const mutedSubjectAlertIdsWithUserId: {
        userId: Ulid
        subjectId: number
      }[] = mutedSubjectAlerts.map((subjectName) => ({
        userId,
        subjectId: subjectNameIdMapping[subjectName],
      }))

      await pgQueries.insertMutedUserSubjectAlerts.run(
        { mutedSubjectAlertIdsWithUserId },
        tc ?? getClient()
      )
    }
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function deleteUserPhoneInfo(
  userId: Ulid
): Promise<IDeletePhoneResult | undefined> {
  try {
    const result = await pgQueries.deletePhone.run(
      {
        userId,
      },
      getClient()
    )
    if (result.length) return makeRequired(result[0])
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
        'banType',
      ])
      ret.email = ret.email.toLowerCase()
      return ret
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getUsersLatestSubjectsByUserId(
  userId: Ulid
): Promise<string[]> {
  try {
    const result = await pgQueries.getUsersLatestSubjectsByUserId.run(
      { userId },
      getClient()
    )
    if (result.length) return result.map((row) => makeRequired(row).subject)
    return []
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function updateUserProxyEmail(
  userId: Ulid,
  proxyEmail: string
): Promise<void> {
  try {
    const result = await pgQueries.updateUserProxyEmail.run(
      { userId, proxyEmail },
      getClient()
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new RepoUpdateError('Update query did not return ok')
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export type TAdminUpdateUserPayload = {
  firstName?: string
  lastName?: string
  email: string
  isVerified: boolean
  ban_type?: USER_BAN_TYPES
  ban_reason?: USER_BAN_REASONS
  isDeactivated: boolean
}
export async function adminUpdateUser(
  userId: Ulid,
  updateData: TAdminUpdateUserPayload,
  tc: TransactionClient
) {
  try {
    await pgQueries.adminUpdateUser.run(
      {
        userId,
        ...updateData,
      },
      tc
    )
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function updatePreferredLanguageToUser(
  userId: Uuid,
  preferredLanguage: string,
  tc?: TransactionClient
) {
  try {
    const result = await pgQueries.updatePreferredLanguageToUser.run(
      {
        userId,
        preferredLanguage,
      },
      tc ?? getClient()
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new RepoUpdateError('Update query did not return ok')
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function flagUserForDeletion(userId: Uuid) {
  try {
    await pgQueries.flagUserForDeletion.run(
      {
        userId,
      },
      getClient()
    )
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

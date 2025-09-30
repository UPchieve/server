import crypto from 'crypto'
import { omit } from 'lodash'
import { Ulid, Uuid } from '../models/pgUtils'
import {
  ACCOUNT_USER_ACTIONS,
  EVENTS,
  IP_ADDRESS_STATUS,
  PHOTO_ID_STATUS,
  REFERENCE_STATUS,
  USER_BAN_REASONS,
  USER_BAN_TYPES,
} from '../constants'
import {
  UserNotFoundError,
  NotAllowedError,
  InputError,
} from '../models/Errors'
import { updateIpStatusByUserId } from '../models/IpAddress'
import { adminUpdateStudent } from '../models/Student'
import {
  UserContactInfo,
  getUsersForAdminSearch,
  deleteUser,
  deleteUserPhoneInfo,
  UserForAdmin,
  UserRole,
  updatePreferredLanguageToUser,
} from '../models/User'
import * as UserRepo from '../models/User'
import {
  UnsentReference,
  VolunteerContactInfo,
  addVolunteerReferenceById,
  updateVolunteerPhotoIdById,
  updateVolunteerReferenceSentById,
  updateVolunteerForAdmin,
  updateVolunteerReferenceSubmission,
  checkReferenceExistsBeforeAdding,
  updateVolunteerReferenceStatus,
} from '../models/Volunteer'
import { asReferenceFormData } from '../utils/reference-utils'
import { checkEmail } from '../utils/auth-utils'
import {
  asBoolean,
  asEnum,
  asFactory,
  asNumber,
  asOptional,
  asString,
} from '../utils/type-utils'
import * as AnalyticsService from './AnalyticsService'
import * as MailService from './MailService'
import * as UserRolesService from './UserRolesService'
import * as TeacherService from './TeacherService'
import logger from '../logger'
import { createAccountAction, createAdminAction } from '../models/UserAction'
import { getLegacyUserObject } from '../models/User/legacy-user'
import { PrimaryUserRole, RoleContext } from './UserRolesService'
import * as ModerationInfractionsService from '../models/ModerationInfractions'
import { runInTransaction, TransactionClient } from '../db'
import * as VolunteerService from './VolunteerService'
import * as ImpactStatsService from './ImpactStatsService'
import config from '../config'

export async function parseUser(baseUser: UserContactInfo) {
  const user = await getLegacyUserObject(baseUser.id)

  user.numReferredVolunteers = await countReferredUsers(user.id, {
    withRoles: ['volunteer'],
  })

  // Approved volunteer
  if (user.roleContext.isActiveRole('volunteer') && user.isApproved) {
    user.hoursTutored = Number(user.hoursTutored)

    user.hoursTutoredThisWeek = await ImpactStatsService.hoursTutoredThisWeek(
      baseUser.id
    )

    user.uniqueStudentsHelpedCount =
      await ImpactStatsService.uniqueStudentsHelpedCount(baseUser.id)

    user.sponsorships = await VolunteerService.getActiveSponsorshipsByUserId(
      baseUser.id
    )
    return omit(user, ['references', 'photoIdS3Key', 'photoIdStatus'])
  }

  return user
}

export async function addPhotoId(userId: Ulid, ip: string): Promise<string> {
  const photoIdS3Key = crypto.randomBytes(32).toString('hex')
  await createAccountAction({
    userId,
    ipAddress: ip,
    action: ACCOUNT_USER_ACTIONS.ADDED_PHOTO_ID,
  })
  await updateVolunteerPhotoIdById(
    userId,
    photoIdS3Key,
    PHOTO_ID_STATUS.SUBMITTED
  )
  return photoIdS3Key
}

interface AddReferencePayload {
  userId: Ulid
  userEmail: string
  referenceFirstName: string
  referenceLastName: string
  referenceEmail: string
  ip: string
}
const asAddReferencePayload = asFactory<AddReferencePayload>({
  userId: asString,
  userEmail: asString,
  referenceFirstName: asString,
  referenceLastName: asString,
  referenceEmail: asString,
  ip: asString,
})

export async function addReference(data: unknown) {
  const {
    userId,
    userEmail,
    referenceFirstName,
    referenceLastName,
    referenceEmail,
    ip,
  } = asAddReferencePayload(data)
  const referenceData = {
    firstName: referenceFirstName,
    lastName: referenceLastName,
    email: referenceEmail.toLowerCase(),
  }

  if (userEmail === referenceData.email) {
    throw new NotAllowedError(
      'Your reference cannot have the same email address as you.'
    )
  }

  const isExistingReference = await checkReferenceExistsBeforeAdding(
    userId,
    referenceEmail
  )
  if (
    isExistingReference &&
    isExistingReference.email.toLowerCase() === referenceEmail.toLowerCase() &&
    !isExistingReference.actions.includes(
      ACCOUNT_USER_ACTIONS.REJECTED_REFERENCE
    )
  ) {
    await updateVolunteerReferenceStatus(
      isExistingReference.id,
      REFERENCE_STATUS.UNSENT
    )
    await createAccountAction({
      userId,
      ipAddress: ip,
      action: ACCOUNT_USER_ACTIONS.ADDED_REFERENCE,
      referenceEmail,
    })
    return
  } else if (
    isExistingReference &&
    isExistingReference.actions.includes(
      ACCOUNT_USER_ACTIONS.REJECTED_REFERENCE
    )
  ) {
    throw new NotAllowedError('You cannot re-add a rejected reference.')
  }

  await addVolunteerReferenceById(userId, referenceData)
  await createAccountAction({
    userId,
    ipAddress: ip,
    action: ACCOUNT_USER_ACTIONS.ADDED_REFERENCE,
    referenceEmail,
  })
}

export async function saveReferenceForm(
  userId: Ulid,
  referenceId: Ulid,
  referenceEmail: string,
  referenceFormData: unknown,
  ip: string
) {
  const {
    affiliation,
    relationshipLength,
    patient,
    positiveRoleModel,
    agreeableAndApproachable,
    communicatesEffectively,
    trustworthyWithChildren,
    rejectionReason,
    additionalInfo,
  } = asReferenceFormData(referenceFormData)

  await createAccountAction({
    userId,
    ipAddress: ip,
    action: ACCOUNT_USER_ACTIONS.SUBMITTED_REFERENCE_FORM,
    referenceEmail,
  })

  await updateVolunteerReferenceSubmission(referenceId, {
    affiliation,
    relationshipLength,
    patient,
    positiveRoleModel,
    agreeableAndApproachable,
    communicatesEffectively,
    trustworthyWithChildren,
    rejectionReason,
    additionalInfo,
  })
}

export async function notifyReference(
  reference: UnsentReference,
  volunteer: VolunteerContactInfo
) {
  // TODO: error handling - these need to be 'atomic'
  await MailService.sendReferenceForm(reference, volunteer)
  await updateVolunteerReferenceSentById(reference.id)
}

interface AdminUpdate {
  userId: Ulid
  firstName?: string
  lastName?: string
  email: string
  partnerOrg?: string
  partnerSite?: string
  isVerified: boolean
  banType?: USER_BAN_TYPES
  isDeactivated: boolean
  isApproved?: boolean
  inGatesStudy?: boolean
  partnerSchool?: string
  schoolId?: string
}
const asAdminUpdate = asFactory<AdminUpdate>({
  userId: asString,
  firstName: asOptional(asString),
  lastName: asOptional(asString),
  email: asString,
  partnerOrg: asOptional(asString),
  partnerSite: asOptional(asString),
  isVerified: asBoolean,
  banType: asOptional(asEnum(USER_BAN_TYPES)),
  isDeactivated: asBoolean,
  isApproved: asOptional(asBoolean),
  inGatesStudy: asOptional(asBoolean),
  partnerSchool: asOptional(asString),
  schoolId: asOptional(asString),
})

export async function flagForDeletion(user: UserContactInfo) {
  try {
    // If a user is requesting deletion, we should remove them from automatic emails
    await MailService.deleteContactByEmail(user.email)
  } catch (err) {
    logger.error(
      `Error searching for or deleting contact in user deletion process: ${err}`
    )
  }
  await deleteUser(user.id, `${user.email}deactivated`)
}

export async function adminUpdateUser(data: unknown) {
  const {
    userId,
    firstName,
    lastName,
    email,
    partnerOrg,
    partnerSite,
    isVerified,
    banType,
    isDeactivated,
    isApproved,
    inGatesStudy,
    partnerSchool,
    schoolId,
  } = asAdminUpdate(data)

  checkEmail(email)

  const userBeforeUpdate = await getUserForAdminDetail(userId, 0, 0)

  if (!userBeforeUpdate) {
    throw new UserNotFoundError('id', userId)
  }

  const isVolunteer = userBeforeUpdate.roleContext.legacyRole === 'volunteer'
  const isStudent = userBeforeUpdate.roleContext.legacyRole === 'student'
  const isTeacher = userBeforeUpdate.roleContext.legacyRole === 'teacher'

  const trimmedEmail = email.trim()
  const isUpdatedEmail = userBeforeUpdate.email !== trimmedEmail

  // Remove the contact associated with the previous email from SendGrid
  if (isUpdatedEmail) {
    await MailService.deleteContactByEmail(userBeforeUpdate.email)
  }

  // if unbanning student, also unban their IP addresses
  if (
    isStudent &&
    userBeforeUpdate.banType === USER_BAN_TYPES.COMPLETE &&
    banType !== USER_BAN_TYPES.COMPLETE
  )
    await updateIpStatusByUserId(userBeforeUpdate.id, IP_ADDRESS_STATUS.OK)

  if (
    userBeforeUpdate.banType !== USER_BAN_TYPES.COMPLETE &&
    banType === USER_BAN_TYPES.COMPLETE
  )
    // TODO: queue email
    await MailService.sendBannedUserAlert(userId, 'admin')

  //track shadow bans
  if (
    userBeforeUpdate.banType !== USER_BAN_TYPES.SHADOW &&
    banType === USER_BAN_TYPES.SHADOW
  ) {
    await createAdminAction(ACCOUNT_USER_ACTIONS.SHADOW_BANNED, userId)
  }

  //track reversing shadow bans
  if (userBeforeUpdate.banType === USER_BAN_TYPES.SHADOW && !banType) {
    await createAdminAction(ACCOUNT_USER_ACTIONS.UNSHADOW_BANNED, userId)
  }

  //track live_media bans
  if (
    userBeforeUpdate.banType !== USER_BAN_TYPES.LIVE_MEDIA &&
    banType === USER_BAN_TYPES.LIVE_MEDIA
  ) {
    await createAdminAction(ACCOUNT_USER_ACTIONS.LIVE_MEDIA_BANNED, userId)
  }

  //track reversing live_media bans
  if (userBeforeUpdate.banType === USER_BAN_TYPES.LIVE_MEDIA && !banType) {
    await createAdminAction(ACCOUNT_USER_ACTIONS.UNLIVE_MEDIA_BANNED, userId)
    await ModerationInfractionsService.deactivateModerationInfractionByUserId(
      userId
    )
  }

  const update = {
    firstName,
    lastName,
    email: trimmedEmail,
    isVerified,
    banType,
    isDeactivated,
    isApproved,
    volunteerPartnerOrg: isVolunteer && partnerOrg ? partnerOrg : undefined,
    studentPartnerOrg: isStudent && partnerOrg ? partnerOrg : undefined,
    partnerSite: isStudent && partnerSite ? partnerSite : undefined,
    inGatesStudy: isStudent && inGatesStudy ? inGatesStudy : undefined,
    banReason: banType ? ('admin' as USER_BAN_REASONS) : undefined,
    partnerSchool: isStudent && partnerSchool ? partnerSchool : undefined,
    schoolId,
  }

  if (isStudent) {
    // tracking organic/partner students for posthog if there is a change in partner status
    if (userBeforeUpdate.studentPartnerOrg !== partnerOrg) {
      AnalyticsService.identify(userId, {
        partner: partnerOrg,
      })
    }
  }

  if (isDeactivated && !userBeforeUpdate.isDeactivated)
    await createAccountAction({
      userId,
      action: ACCOUNT_USER_ACTIONS.DEACTIVATED,
    })

  if (isVolunteer) {
    await updateVolunteerForAdmin(userId, update)
  } else if (isStudent) {
    await adminUpdateStudent(userId, update)
  } else if (isTeacher) {
    await TeacherService.adminUpdateTeacher(userId, update)
  }

  await MailService.createContact(userId)
}

interface UserQuery {
  userId?: string
  firstName?: string
  lastName?: string
  email?: string
  partnerOrg?: string
  school?: string
  page?: number
}

const asUserQuery = asFactory<UserQuery>({
  userId: asOptional(asString),
  firstName: asOptional(asString),
  lastName: asOptional(asString),
  email: asOptional(asString),
  partnerOrg: asOptional(asString),
  school: asOptional(asString),
  page: asOptional(asNumber),
})

// getUsersForAdmin with a typed interface for these query params
export async function getUsers(
  data: unknown
): Promise<{ users: UserForAdmin[]; isLastPage: boolean }> {
  const { userId, firstName, lastName, email, partnerOrg, school, page } =
    asUserQuery(data)
  const pageNum = page || 1
  const PER_PAGE = 15
  const skip = (pageNum - 1) * PER_PAGE

  try {
    const users = await getUsersForAdminSearch(
      {
        userId,
        firstName,
        lastName,
        email,
        partnerOrg,
        school,
      },
      PER_PAGE,
      skip
    )

    const withUserTypes = users.map(async (u) => {
      const roleContext = await UserRolesService.getRoleContext(u.id)
      return {
        ...u,
        userType: roleContext.legacyRole,
      }
    })
    const usersWithUserType = await Promise.all(withUserTypes)

    const isLastPage = users.length < PER_PAGE
    return { users: usersWithUserType, isLastPage }
  } catch (error) {
    throw new Error((error as Error).message)
  }
}

export async function deletePhoneFromAccount(userId: Ulid) {
  const roleContext = await UserRolesService.getRoleContext(userId)
  if (roleContext.hasRole('volunteer')) {
    throw new InputError(
      'Phone information is required for UPchieve volunteers'
    )
  }
  await deleteUserPhoneInfo(userId)
}

export async function getUserByReferralCode(referralCode: string) {
  const user = await UserRepo.getUserByReferralCode(referralCode)
  if (user) {
    const roleContext = await UserRolesService.getRoleContext(user.id)
    return {
      ...user,
      userType: roleContext.legacyRole,
    }
  }
}

export async function getUserContactInfo(
  userId: string,
  tc?: TransactionClient
): Promise<(UserContactInfo & { roleContext: RoleContext }) | undefined> {
  const baseUserInfo = await UserRepo.getUserContactInfoById(userId, tc)
  if (baseUserInfo) {
    // TODO: The roles are returned in `getUserContactInfoById`. Can we reuse
    // those instead of having to refetch on cache miss in method below?
    const roleContext = await UserRolesService.getRoleContext(userId, false, tc)
    return {
      ...baseUserInfo,
      roleContext,
    }
  }
}

export async function getUserBanStatus(
  userId: Ulid
): Promise<USER_BAN_TYPES | undefined> {
  const user = await UserRepo.getUserBanStatus(userId)
  if (user) {
    return user.banType
  }
}

export async function getUserForAdminDetail(
  userId: Ulid,
  // TODO: Make these pagination parameters more clear.
  limit: number,
  offset: number
) {
  const user = await UserRepo.getUserForAdminDetail(userId, limit, offset)
  if (user) {
    const roleContext = await UserRolesService.getRoleContext(userId, false)
    return {
      ...user,
      roleContext,
    }
  }
}

export async function switchActiveRoleForUser(
  userId: string,
  role: PrimaryUserRole
): Promise<{ activeRole: PrimaryUserRole; user: any }> {
  const { newRoleContext } = await UserRolesService.switchActiveRole(
    userId,
    role
  )
  const userContactInfo = await getUserContactInfo(userId)
  if (!userContactInfo)
    throw new Error(
      "Failed to switch user's active role: User contact info not found"
    )
  const parsedUser = await parseUser(userContactInfo)
  return { activeRole: newRoleContext.activeRole, user: parsedUser }
}

export async function updatePreferredLanguage(
  userId: Uuid,
  languageCode: string
): Promise<void> {
  return await updatePreferredLanguageToUser(userId, languageCode)
}

export async function countReferredUsers(
  referrerId: string,
  filters?: {
    withPhoneOrEmailVerifiedAs?: boolean
    withRoles?: UserRole[]
  }
): Promise<number> {
  return await UserRepo.countReferredUsers(referrerId, filters)
}

export function getReferralSignUpLink(referralCode: string): string {
  return `${config.protocol}://${config.host}/referral/${referralCode}`
}

export function getUserIdByPhone(phone: string): Promise<Ulid | undefined> {
  return UserRepo.getUserIdByPhone(phone)
}

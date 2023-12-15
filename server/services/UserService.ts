import crypto from 'crypto'
import { omit } from 'lodash'
import { Ulid } from '../models/pgUtils'
import {
  ACCOUNT_USER_ACTIONS,
  EVENTS,
  IP_ADDRESS_STATUS,
  PHOTO_ID_STATUS,
  REFERENCE_STATUS,
} from '../constants'
import { UserNotFoundError, NotAllowedError } from '../models/Errors'
import { updateIpStatusByUserId } from '../models/IpAddress'
import { adminUpdateStudent } from '../models/Student'
import {
  UserContactInfo,
  getUserContactInfoById,
  getUsersForAdminSearch,
  deleteUser,
  updateUserProfileById,
} from '../models/User'
import {
  UnsentReference,
  VolunteerContactInfo,
  addVolunteerReferenceById,
  updateVolunteerPhotoIdById,
  updateVolunteerReferenceSentById,
  deleteVolunteerReferenceByEmail,
  updateVolunteerForAdmin,
  updateVolunteerReferenceSubmission,
  checkReferenceExistsBeforeAdding,
  updateVolunteerReferenceStatus,
} from '../models/Volunteer'
import { asReferenceFormData } from '../utils/reference-utils'
import {
  asBoolean,
  asFactory,
  asNumber,
  asOptional,
  asString,
} from '../utils/type-utils'
import * as AnalyticsService from './AnalyticsService'
import * as MailService from './MailService'
import logger from '../logger'
import { createAccountAction } from '../models/UserAction'
import { getLegacyUserObject } from '../models/User/legacy-user'

export async function parseUser(baseUser: UserContactInfo) {
  const user = await getLegacyUserObject(baseUser.id)

  // Approved volunteer
  if (user.isVolunteer && user.isApproved) {
    user.hoursTutored = Number(user.hoursTutored)
    return omit(user, ['references', 'photoIdS3Key', 'photoIdStatus'])
  }

  // Student or unapproved volunteer
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

// TODO: remove once job is executed
export async function notifyReferenceApology(
  reference: UnsentReference,
  volunteer: VolunteerContactInfo
) {
  await MailService.sendReferenceFormApology(reference, volunteer)
  await updateVolunteerReferenceSentById(reference.id)
}

export async function deleteReference(
  userId: Ulid,
  referenceEmail: string,
  ip: string
) {
  await createAccountAction({
    userId,
    ipAddress: ip,
    action: ACCOUNT_USER_ACTIONS.DELETED_REFERENCE,
    referenceEmail,
  })
  AnalyticsService.captureEvent(userId, EVENTS.REFERENCE_DELETED, {
    event: EVENTS.REFERENCE_DELETED,
    referenceEmail,
  })
  await deleteVolunteerReferenceByEmail(userId, referenceEmail)
}

interface AdminUpdate {
  userId: Ulid
  firstName?: string
  lastName?: string
  email: string
  partnerOrg?: string
  partnerSite?: string
  isVerified: boolean
  isBanned: boolean
  isDeactivated: boolean
  isApproved?: boolean
  inGatesStudy?: boolean
  partnerSchool?: string
}
const asAdminUpdate = asFactory<AdminUpdate>({
  userId: asString,
  firstName: asOptional(asString),
  lastName: asOptional(asString),
  email: asString,
  partnerOrg: asOptional(asString),
  partnerSite: asOptional(asString),
  isVerified: asBoolean,
  isBanned: asBoolean,
  isDeactivated: asBoolean,
  isApproved: asOptional(asBoolean),
  inGatesStudy: asOptional(asBoolean),
  partnerSchool: asOptional(asString),
})

export async function flagForDeletion(user: UserContactInfo) {
  try {
    // if a user is requesting deletion, we should remove them from automatic emails
    const contact = await MailService.searchContact(user.email)
    if (contact) await MailService.deleteContact(contact.id)
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
    isBanned,
    isDeactivated,
    isApproved,
    inGatesStudy,
    partnerSchool,
  } = asAdminUpdate(data)
  // replaced by UserRepo.getUserForAdminUpdate
  const userBeforeUpdate = await getUserContactInfoById(userId)
  if (!userBeforeUpdate) {
    throw new UserNotFoundError('id', userId)
  }
  const { isVolunteer } = userBeforeUpdate
  const isUpdatedEmail = userBeforeUpdate.email !== email

  // Remove the contact associated with the previous email from SendGrid
  if (isUpdatedEmail) {
    const contact = await MailService.searchContact(userBeforeUpdate.email)
    if (contact) MailService.deleteContact(contact.id)
  }

  // if unbanning student, also unban their IP addresses
  if (!isVolunteer && userBeforeUpdate.banned && !isBanned)
    await updateIpStatusByUserId(userBeforeUpdate.id, IP_ADDRESS_STATUS.OK)

  if (!userBeforeUpdate.banned && isBanned)
    // TODO: queue email
    await MailService.sendBannedUserAlert(userId, 'admin')

  const update = {
    firstName,
    lastName,
    email,
    isVerified,
    isBanned,
    isDeactivated,
    isApproved,
    volunteerPartnerOrg: isVolunteer && partnerOrg ? partnerOrg : undefined,
    studentPartnerOrg: !isVolunteer && partnerOrg ? partnerOrg : undefined,
    partnerSite: !isVolunteer && partnerSite ? partnerSite : undefined,
    inGatesStudy: !isVolunteer && inGatesStudy ? inGatesStudy : undefined,
    banReason: isBanned ? 'admin' : undefined,
    partnerSchool: !isVolunteer && partnerSchool ? partnerSchool : undefined,
  }

  if (!isVolunteer) {
    // tracking organic/partner students for posthog if there is a change in partner status
    if (userBeforeUpdate.studentPartnerOrg !== partnerOrg) {
      AnalyticsService.identify(userId, {
        partner: partnerOrg,
      })
    }
  }

  if (isDeactivated && !userBeforeUpdate.deactivated)
    await createAccountAction({
      userId,
      action: ACCOUNT_USER_ACTIONS.DEACTIVATED,
    })

  if (isVolunteer) {
    await updateVolunteerForAdmin(userId, update)
  } else {
    await adminUpdateStudent(userId, update)
  }

  await MailService.createContact(userId)
}

interface UserQuery {
  userId?: string
  firstName?: string
  lastName?: string
  email?: string
  partnerOrg?: string
  highSchool?: string
  page?: number
}

const asUserQuery = asFactory<UserQuery>({
  userId: asOptional(asString),
  firstName: asOptional(asString),
  lastName: asOptional(asString),
  email: asOptional(asString),
  partnerOrg: asOptional(asString),
  highSchool: asOptional(asString),
  page: asOptional(asNumber),
})

// getUsersForAdmin with a typed interface for these query params
export async function getUsers(data: unknown) {
  const {
    userId,
    firstName,
    lastName,
    email,
    partnerOrg,
    highSchool,
    page,
  } = asUserQuery(data)
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
        highSchool,
      },
      PER_PAGE,
      skip
    )

    const isLastPage = users.length < PER_PAGE
    return { users, isLastPage }
  } catch (error) {
    throw new Error((error as Error).message)
  }
}

export async function updateUserProfile(
  userId: Ulid,
  opts: {
    deactivated?: boolean
    phone?: string
    smsConsent?: boolean
    mutedSubjectAlerts?: string[]
  }
) {
  await updateUserProfileById(userId, opts)
}

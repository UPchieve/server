import crypto from 'crypto'
import { omit } from 'lodash'
import { Ulid } from '../models/pgUtils'
import { ACCOUNT_USER_ACTIONS, EVENTS, IP_ADDRESS_STATUS, PHOTO_ID_STATUS, REFERENCE_STATUS } from '../constants'
import * as UserActionCtrl from '../controllers/UserActionCtrl'
import { UserNotFoundError } from '../models/Errors'
import { updateIpStatusByUserId } from '../models/IpAddress'
import { Student } from '../models/Student'
import { LegacyUser, UserContactInfo, getUserContactInfoById, getUsersForAdminSearch, getUserForAdminDetail } from '../models/User'
import {
  UnsentReference,
  VolunteerContactInfo,
  addVolunteerReferenceById,
  updateVolunteerPhotoIdById,
  updateVolunteerReferenceStatusById,
  deleteVolunteerReferenceByEmail
} from '../models/Volunteer'
import {
  studentPartnerManifests,
  volunteerPartnerManifests,
} from '../partnerManifests'
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

// TODO: come back when legacy user is done
export function parseUser(user: User | Student | Volunteer) {
  // Approved volunteer
  if (user.isVolunteer && (user as Volunteer).isApproved) {
    ;(user as Volunteer).hoursTutored = Number((user as Volunteer).hoursTutored)
    return omit(user, ['references', 'photoIdS3Key', 'photoIdStatus'])
  }

  // Student or unapproved volunteer
  return user
}

export async function addPhotoId(
  userId: Ulid,
  ip: string
): Promise<string> {
  const photoIdS3Key = crypto.randomBytes(32).toString('hex')
  await createAccountAction({
    userId,
    ipAddress: ip,
    action: ACCOUNT_USER_ACTIONS.ADDED_PHOTO_ID
  })
  await updateVolunteerPhotoIdById(userId, photoIdS3Key, PHOTO_ID_STATUS.SUBMITTED)
  return photoIdS3Key
}

interface AddReferencePayload {
  userId: Ulid
  referenceFirstName: string
  referenceLastName: string
  referenceEmail: string
  ip: string
}
const asAddReferencePayload = asFactory<AddReferencePayload>({
  userId: asString,
  referenceFirstName: asString,
  referenceLastName: asString,
  referenceEmail: asString,
  ip: asString,
})

export async function addReference(data: unknown) {
  const {
    userId,
    referenceFirstName,
    referenceLastName,
    referenceEmail,
    ip,
  } = asAddReferencePayload(data)
  const referenceData = {
    firstName: referenceFirstName,
    lastName: referenceLastName,
    email: referenceEmail,
  }
  await addVolunteerReferenceById(userId, referenceData)
  await createAccountAction({
    userId,
    ipAddress: ip,
    action: ACCOUNT_USER_ACTIONS.ADDED_REFERENCE,
    referenceEmail
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
    referenceEmail
  })

  // See: https://docs.mongodb.com/manual/reference/operator/update/positional/#up._S_
  // TODO: repo pattern
  return VolunteerModel.updateOne(
    { 'references._id': referenceId },
    {
      $set: {
        'references.$.status': REFERENCE_STATUS.SUBMITTED,
        'references.$.affiliation': affiliation,
        'references.$.relationshipLength': relationshipLength,
        'references.$.rejectionReason': rejectionReason,
        'references.$.additionalInfo': additionalInfo,
        'references.$.patient': patient,
        'references.$.positiveRoleModel': positiveRoleModel,
        'references.$.agreeableAndApproachable': agreeableAndApproachable,
        'references.$.communicatesEffectively': communicatesEffectively,
        'references.$.trustworthyWithChildren': trustworthyWithChildren,
      },
    }
  )
}

export async function notifyReference(
  reference: UnsentReference,
  volunteer: VolunteerContactInfo
) {
  // TODO: error handling - these need to be 'atomic'
  await MailService.sendReferenceForm(reference, volunteer)
  await updateVolunteerReferenceStatusById(reference.id)
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
    referenceEmail
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
  email?: string
  partnerOrg?: string
  partnerSite?: string
  isVerified?: boolean
  isBanned?: boolean
  isDeactivated?: boolean
  isApproved?: boolean
  inGatesStudy?: boolean
}
const asAdminUpdate = asFactory<AdminUpdate>({
  userId: asString,
  firstName: asOptional(asString),
  lastName: asOptional(asString),
  email: asOptional(asString),
  partnerOrg: asOptional(asString),
  partnerSite: asOptional(asString),
  isVerified: asOptional(asBoolean),
  isBanned: asOptional(asBoolean),
  isDeactivated: asOptional(asBoolean),
  isApproved: asOptional(asBoolean),
  inGatesStudy: asOptional(asBoolean),
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

  const update: any = {
    email: `${user.email}deactivated`,
  }

  if (user.isVolunteer) {
    // TODO: repo pattern
    return VolunteerModel.updateOne({ _id: user._id }, update)
  } else {
    // Replace with deleteStudent from Student Repo
    return StudentModel.updateOne({ _id: user._id }, update)
  }
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
  } = asAdminUpdate(data)
  // replaced by UserRepo.getUserForAdminUpdate
  const userBeforeUpdate = await getUserContactInfoById(userId)
  if (!userBeforeUpdate) {
    throw new UserNotFoundError('_id', userId.toString())
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
    await MailService.sendBannedUserAlert(userId, 'ADMIN')

  const update: any = {
    firstname: firstName,
    lastname: lastName,
    email,
    verified: isVerified,
    isBanned,
    isDeactivated,
    isApproved,
    $unset: {},
  }

  if (isVolunteer) {
    if (partnerOrg) update.volunteerPartnerOrg = partnerOrg
    else update.$unset.volunteerPartnerOrg = ''
  }

  if (!isVolunteer) {
    if (partnerOrg) update.studentPartnerOrg = partnerOrg
    else update.$unset.studentPartnerOrg = ''

    if (partnerSite) update.partnerSite = partnerSite
    else update.$unset.partnerSite = ''

    if (inGatesStudy !== undefined) update.inGatesStudy = inGatesStudy

    // tracking organic/partner students for posthog if there is a change in partner status
    if (userBeforeUpdate.studentPartnerOrg !== partnerOrg) {
      AnalyticsService.identify(userId, {
        partner: partnerOrg,
      })
    }
  }

  if (isBanned) update.banReason = 'ADMIN'
  if (isDeactivated && !userBeforeUpdate.deactivated)
    await new UserActionCtrl.AdminActionCreator(
      userId.toString()
    ).adminDeactivatedAccount()

  // Remove $unset property if it has no properties to remove
  if (Object.keys(update.$unset).length === 0) delete update.$unset

  // TODO: shouldn't this totally fuck up the objects????
  const updatedUser = Object.assign(userBeforeUpdate, update)
  MailService.createContact(updatedUser)

  if (isVolunteer) {
    // TODO: repo pattern
    return VolunteerModel.updateOne({ _id: userId }, update)
  } else {
    // Replace with adminUpdateStudent from Student Repo
    return StudentModel.updateOne({ _id: userId }, update)
  }
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
    const users = await getUsersForAdminSearch({
      userId,
      firstName,
      lastName,
      email,
      partnerOrg,
      highSchool
    }, PER_PAGE, skip)

    const isLastPage = users.length < PER_PAGE
    return { users, isLastPage }
  } catch (error) {
    throw new Error((error as Error).message)
  }
}

// @note: this query is making a request for user data on every page transition
//        for new pastSessions to display. May be better served as a separate
//        service method for getting the user's past sessions
export async function adminGetUser(userId: Ulid) {
  const user = await getUserForAdminDetail(userId)

  return user
}

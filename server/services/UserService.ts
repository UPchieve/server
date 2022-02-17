import crypto from 'crypto'
import { omit } from 'lodash'
import { Types } from 'mongoose'
import { EVENTS, REFERENCE_STATUS, USER_BAN_REASON } from '../constants'
import * as UserActionCtrl from '../controllers/UserActionCtrl'
import { UserNotFoundError } from '../models/Errors'
import { unbanIpsByUser } from '../models/IpAddress/queries'
import StudentModel, { Student } from '../models/Student'
import UserModel, { User } from '../models/User'
import { getUserById } from '../models/User/queries'
import VolunteerModel, { Reference, Volunteer } from '../models/Volunteer'
import {
  addVolunteerReferenceById,
  deleteVolunteerReferenceById,
  updateVolunteerPhotoIdById,
  updateVolunteerReferenceStatusById,
} from '../models/Volunteer/queries'
import {
  studentPartnerManifests,
  volunteerPartnerManifests,
} from '../partnerManifests'
import { asReferenceFormData } from '../utils/reference-utils'
import {
  asBoolean,
  asFactory,
  asNumber,
  asObjectId,
  asOptional,
  asString,
} from '../utils/type-utils'
import * as AnalyticsService from './AnalyticsService'
import * as MailService from './MailService'
import { getStudentById } from '../models/Student/queries'
import { getSchool } from './SchoolService'
import { School } from '../models/School'
import { getIdFromModelReference } from '../utils/model-reference'

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
  userId: Types.ObjectId,
  ip: string
): Promise<string> {
  const photoIdS3Key = crypto.randomBytes(32).toString('hex')
  await new UserActionCtrl.AccountActionCreator(userId, ip).addedPhotoId()
  await updateVolunteerPhotoIdById(userId, photoIdS3Key)
  return photoIdS3Key
}

interface AddReferencePayload {
  userId: Types.ObjectId
  referenceFirstName: string
  referenceLastName: string
  referenceEmail: string
  ip: string
}
const asAddReferencePayload = asFactory<AddReferencePayload>({
  userId: asObjectId,
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
  await new UserActionCtrl.AccountActionCreator(userId, ip, {
    referenceEmail,
  }).addedReference()
}

export async function saveReferenceForm(
  userId: Types.ObjectId,
  referenceId: Types.ObjectId,
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

  await new UserActionCtrl.AccountActionCreator(userId, ip, {
    referenceEmail,
  }).submittedReferenceForm()

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
  reference: Reference,
  volunteer: Volunteer
) {
  // TODO: error handling - these need to be 'atomic'
  await MailService.sendReferenceForm(reference, volunteer)
  await updateVolunteerReferenceStatusById(reference._id, new Date())
}

export async function deleteReference(
  userId: Types.ObjectId,
  referenceEmail: string,
  ip: string
) {
  await new UserActionCtrl.AccountActionCreator(userId, ip, {
    referenceEmail,
  }).deletedReference()
  AnalyticsService.captureEvent(userId, EVENTS.REFERENCE_DELETED, {
    event: EVENTS.REFERENCE_DELETED,
    referenceEmail,
  })
  await deleteVolunteerReferenceById(userId, referenceEmail)
}

interface AdminUpdate {
  userId: Types.ObjectId
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
  userId: asObjectId,
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
  const userBeforeUpdate = await getUserById(userId)
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
  if (!isVolunteer && userBeforeUpdate.isBanned && !isBanned)
    await unbanIpsByUser(userBeforeUpdate._id)

  if (!userBeforeUpdate.isBanned && isBanned)
    // TODO: queue email
    await MailService.sendBannedUserAlert(userId, USER_BAN_REASON.ADMIN)

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
  }

  if (isBanned) update.banReason = USER_BAN_REASON.ADMIN
  if (isDeactivated && !userBeforeUpdate.isDeactivated)
    await new UserActionCtrl.AdminActionCreator(
      userId.toString()
    ).adminDeactivatedAccount()

  // Remove $unset property if it has no properties to remove
  if (Object.keys(update.$unset).length === 0) delete update.$unset

  // TODO: shouldn't this totally fuck up the objects????
  const updatedUser = Object.assign(userBeforeUpdate, update)
  MailService.createContact(updatedUser)

  // tracking organic/partner students for posthog if there is a change in partner status
  const studentBeforeUpdate = await getStudentById(
    getIdFromModelReference(userId)
  )
  if (
    studentBeforeUpdate &&
    studentBeforeUpdate.studentPartnerOrg !== partnerOrg
  ) {
    if (partnerOrg)
      AnalyticsService.identify(userId, {
        partner: partnerOrg,
      })
  }

  if (isVolunteer) {
    // TODO: repo pattern
    return VolunteerModel.updateOne({ _id: userId }, update)
  } else {
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
  const query: any = {}
  const pageNum = page || 1
  const PER_PAGE = 15
  const skip = (pageNum - 1) * PER_PAGE

  if (userId) query._id = asObjectId(userId)
  if (firstName) query.firstname = { $regex: firstName, $options: 'i' }
  if (lastName) query.lastname = { $regex: lastName, $options: 'i' }
  if (email) query.email = { $regex: email, $options: 'i' }
  if (partnerOrg) {
    if (studentPartnerManifests[partnerOrg])
      query.studentPartnerOrg = { $regex: partnerOrg, $options: 'i' }

    if (volunteerPartnerManifests[partnerOrg])
      query.volunteerPartnerOrg = { $regex: partnerOrg, $options: 'i' }
  }

  let highSchoolQuery = [
    {
      $lookup: {
        from: 'schools',
        localField: 'approvedHighschool',
        foreignField: '_id',
        as: 'highSchool',
      },
    },
    {
      $unwind: '$highSchool',
    },
    {
      $match: {
        $or: [
          { 'highSchool.nameStored': { $regex: highSchool, $options: 'i' } },
          { 'highSchool.SCH_NAME': { $regex: highSchool, $options: 'i' } },
        ],
      },
    },
  ]

  const aggregateQuery: any[] = [{ $match: query }]
  if (highSchool) aggregateQuery.push(...highSchoolQuery)

  try {
    // TODO: repo pattern
    const users = await UserModel.aggregate(aggregateQuery)
      .skip(skip)
      .limit(PER_PAGE)
      .exec()

    const isLastPage = users.length < PER_PAGE
    return { users, isLastPage }
  } catch (error) {
    throw new Error((error as Error).message)
  }
}

// @note: this query is making a request for user data on every page transition
//        for new pastSessions to display. May be better served as a separate
//        service method for getting the user's past sessions
export async function adminGetUser(userId: Types.ObjectId, page: number = 1) {
  // TODO: repo pattern
  const [results] = await UserModel.aggregate([
    {
      $match: {
        _id: userId,
      },
    },
    {
      $project: {
        firstname: 1,
        lastname: 1,
        email: 1,
        createdAt: 1,
        isVolunteer: 1,
        isApproved: 1,
        isAdmin: 1,
        isBanned: 1,
        isDeactivated: 1,
        isTestUser: 1,
        isFakeUser: 1,
        partnerSite: 1,
        zipCode: 1,
        background: 1,
        studentPartnerOrg: 1,
        volunteerPartnerOrg: 1,
        approvedHighschool: 1,
        photoIdS3Key: 1,
        photoIdStatus: 1,
        references: 1,
        occupation: 1,
        country: 1,
        verified: 1,
        numPastSessions: { $size: '$pastSessions' },
        pastSessions: { $slice: ['$pastSessions', -10 * page, 10] },
        inGatesStudy: 1,
      },
    },
    {
      $facet: {
        user: [
          {
            $lookup: {
              from: 'schools',
              localField: 'approvedHighschool',
              foreignField: '_id',
              as: 'approvedHighschool',
            },
          },
          {
            $unwind: {
              path: '$approvedHighschool',
              preserveNullAndEmptyArrays: true,
            },
          },
        ],
        pastSessions: [
          {
            $unwind: {
              path: '$pastSessions',
            },
          },
          {
            $lookup: {
              from: 'sessions',
              let: {
                sessionId: '$pastSessions',
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$_id', '$$sessionId'],
                    },
                  },
                },
                {
                  $project: {
                    type: 1,
                    subTopic: 1,
                    totalMessages: {
                      $size: '$messages',
                    },
                    volunteer: 1,
                    student: 1,
                    volunteerJoinedAt: 1,
                    createdAt: 1,
                    endedAt: 1,
                  },
                },
              ],
              as: 'pastSessions',
            },
          },
          {
            $unwind: {
              path: '$pastSessions',
            },
          },
          {
            $replaceRoot: {
              newRoot: '$pastSessions',
            },
          },
        ],
      },
    },
  ])

  const user = {
    ...results.user[0],
    pastSessions: results.pastSessions,
  }

  return user
}

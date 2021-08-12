import { studentPartnerManifests, volunteerPartnerManifests } from '../partnerManifests'
import crypto from 'crypto'
import { omit } from 'lodash'
import UserModel from '../models/User'
import VolunteerModel, { Reference, Volunteer } from '../models/Volunteer'
import StudentModel, { Student } from '../models/Student'
import * as MailService from './MailService'
import * as IpAddressService from './IpAddressService'
import { AccountActionCreator, AdminActionCreator } from '../controllers/UserActionCtrl'
import { EVENTS, PHOTO_ID_STATUS, REFERENCE_STATUS, STATUS, USER_ACTION, USER_BAN_REASON } from '../constants'
import AnalyticsService from './AnalyticsService'
import { ObjectId } from 'mongodb'
import { Types } from 'mongoose'

const { DocUpdateError } = require('../models/Errors')

export function getUser(query: {}, projection: {}) {
  return UserModel.findOne(query)
    .select(projection)
    .lean()
    .exec()
}

export function getVolunteer(query: {}, projection: {}) {
  return VolunteerModel.findOne(query, projection)
}

export function getReferredFriends(userId: Types.ObjectId, projection: any) {
  return UserModel.find({ referredBy: userId, verified: true })
    .select(projection)
    .lean()
    .exec()
}

export function updateUser(query: any, update: any) {
  UserModel.updateOne(query, update)
}

export function parseUser(user: Volunteer | Student) {
  // Approved volunteer
  if (user.isVolunteer) {
    user = user as Volunteer
    if (user.isApproved) {
      user.hoursTutored = user.hoursTutored.toString()
      return omit(user, ['references', 'photoIdS3Key', 'photoIdStatus'])
    }
  } else {
    // Student or unapproved volunteer
    return user
  }
}

export async function banUser(userId: Types.ObjectId, banReason: USER_BAN_REASON) {
  return UserModel.updateOne(
    { _id: userId },
    { $set: { isBanned: true, banReason } }
  )
}

export async function addPhotoId(userId: Types.ObjectId, ip: string) {
  const photoIdS3Key = crypto.randomBytes(32).toString('hex')
  await new AccountActionCreator(userId, ip).addedPhotoId()
  await VolunteerModel.updateOne(
    { _id: userId },
    { $set: { photoIdS3Key, photoIdStatus: PHOTO_ID_STATUS.SUBMITTED } }
  )
  return photoIdS3Key
}

export async function addReference(
    userId: string,
    referenceFirstName: string,
    referenceLastName: string,
    referenceEmail: string,
    ip: string
) {
  const referenceData = {
    firstName: referenceFirstName,
    lastName: referenceLastName,
    email: referenceEmail
  }
  await VolunteerModel.updateOne(
    { _id: userId },
    { $push: { references: referenceData } }
  )
  await new AccountActionCreator(new ObjectId(userId), ip, {
    referenceEmail
  }).addedReference()
}

export async function saveReferenceForm(
  userId: Types.ObjectId,
  referenceId: string,
  referenceEmail: string,
  referenceFormData: any,
  ip: string
) {
  const {
    affiliation,
    relationshipLength,
    rejectionReason,
    additionalInfo,
    patient,
    positiveRoleModel,
    agreeableAndApproachable,
    communicatesEffectively,
    trustworthyWithChildren
  } = referenceFormData

  await new AccountActionCreator(userId, ip, {
    referenceEmail
  }).submittedReferenceForm()

  // See: https://docs.mongodb.com/manual/reference/operator/update/positional/#up._S_
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
        'references.$.trustworthyWithChildren': trustworthyWithChildren
      }
    }
  )
}

export async function notifyReference(reference: Reference, volunteer: Volunteer) {
  // @todo: error handling
  await MailService.sendReferenceForm(reference, volunteer)
  return VolunteerModel.updateOne(
    { 'references._id': reference._id },
    {
      $set: {
        'references.$.status': REFERENCE_STATUS.SENT,
        'references.$.sentAt': Date.now()
      }
    }
  )
}

export async function deleteReference(userId: Types.ObjectId, referenceEmail: string, ip: string) {
  await new AccountActionCreator(userId, ip, {
    referenceEmail
  }).deletedReference()
  AnalyticsService.captureEvent(userId, EVENTS.REFERENCE_DELETED, {
    event: EVENTS.REFERENCE_DELETED,
    referenceEmail
  })
  return VolunteerModel.updateOne(
    { _id: userId },
    { $pull: { references: { email: referenceEmail } } }
  )
}

export async function getVolunteersToReview(page: number) {
  const pageNum = page || 1
  const PER_PAGE = 15
  const skip = (pageNum - 1) * PER_PAGE

  try {
    const volunteers = await VolunteerModel.aggregate([
      {
        $match: {
          isApproved: false,
          photoIdS3Key: { $ne: null },
          photoIdStatus: {
            $in: [PHOTO_ID_STATUS.SUBMITTED, PHOTO_ID_STATUS.APPROVED]
          },
          references: { $size: 2 },
          'references.status': {
            $nin: [
              REFERENCE_STATUS.REJECTED,
              REFERENCE_STATUS.UNSENT,
              REFERENCE_STATUS.SENT
            ]
          },
          occupation: { $ne: null },
          country: { $ne: null }
        }
      },
      {
        $project: {
          firstname: 1,
          lastname: 1,
          email: 1,
          createdAt: 1
        }
      },
      {
        $lookup: {
          from: 'useractions',
          localField: '_id',
          foreignField: 'user',
          as: 'userAction'
        }
      },
      {
        $unwind: '$userAction'
      },
      {
        $match: {
          'userAction.action': {
            $in: [
              USER_ACTION.ACCOUNT.ADDED_PHOTO_ID,
              USER_ACTION.ACCOUNT.SUBMITTED_REFERENCE_FORM,
              USER_ACTION.ACCOUNT.COMPLETED_BACKGROUND_INFO
            ]
          }
        }
      },
      {
        $group: {
          _id: '$_id',
          firstname: { $first: '$firstname' },
          lastname: { $first: '$lastname' },
          email: { $first: '$email' },
          // Get the date of their latest user action associated with the approval process
          readyForReviewAt: {
            $max: '$userAction.createdAt'
          }
        }
      }
    ])
      .sort({ readyForReviewAt: 1 })
      .skip(skip)
      .limit(PER_PAGE)

    const isLastPage = volunteers.length < PER_PAGE
    return { volunteers, isLastPage }
  } catch (error) {
    throw new Error(error.message)
  }
}

export async function updatePendingVolunteerStatus(
  volunteerId: string,
  photoIdStatus: string,
  referencesStatus: string
) {
  const volunteerBeforeUpdate = await getVolunteer(volunteerId, {})
  if (!volunteerBeforeUpdate) throw new Error('could not find volunteer to update')
  const hasCompletedBackgroundInfo =
    volunteerBeforeUpdate.occupation &&
    volunteerBeforeUpdate.occupation.length > 0 &&
    volunteerBeforeUpdate.country

  const statuses = [...referencesStatus, photoIdStatus]
  // A volunteer must have the following list items approved before being considered an approved volunteer
  //  1. two references
  //  2. photo id
  const isApproved =
    statuses.every(status => status === STATUS.APPROVED) &&
    hasCompletedBackgroundInfo
  const [referenceOneStatus, referenceTwoStatus] = referencesStatus
  const update = {
    isApproved,
    photoIdStatus,
    'references.0.status': referenceOneStatus,
    'references.1.status': referenceTwoStatus
  }

  await VolunteerModel.updateOne({ _id: volunteerId }, update)

  if (
    photoIdStatus === PHOTO_ID_STATUS.REJECTED &&
    volunteerBeforeUpdate.photoIdStatus !== PHOTO_ID_STATUS.REJECTED
  ) {
    const id = new ObjectId(volunteerId)
    await new AccountActionCreator(id).rejectedPhotoId()
    AnalyticsService.captureEvent(volunteerId, EVENTS.PHOTO_ID_REJECTED, {
      event: EVENTS.PHOTO_ID_REJECTED
    })
    await MailService.sendRejectedPhotoSubmission(volunteerBeforeUpdate)
  }

  const isNewlyApproved = isApproved && !volunteerBeforeUpdate.isApproved
  if (isNewlyApproved)
    await new AccountActionCreator(new ObjectId(volunteerId)).accountApproved()
  AnalyticsService.captureEvent(volunteerId, EVENTS.ACCOUNT_APPROVED, {
    event: EVENTS.ACCOUNT_APPROVED
  })
  if (isNewlyApproved && !volunteerBeforeUpdate.isOnboarded)
    await MailService.sendApprovedNotOnboardedEmail(volunteerBeforeUpdate)

  for (let i = 0; i < referencesStatus.length; i++) {
    const reference = volunteerBeforeUpdate.references[i]
    if (
      referencesStatus[i] === REFERENCE_STATUS.REJECTED &&
      reference.status !== REFERENCE_STATUS.REJECTED
    ) {
      await new AccountActionCreator(new ObjectId(volunteerId), '', {
        referenceEmail: reference.email
      }).rejectedReference()
      AnalyticsService.captureEvent(volunteerId, EVENTS.REFERENCE_REJECTED, {
        event: EVENTS.REFERENCE_REJECTED,
        referenceEmail: reference.email
      })
      await MailService.sendRejectedReference(
        volunteerBeforeUpdate,
        reference
      )
    }
  }
}

export async function addBackgroundInfo(volunteerId: Types.ObjectId, update: any, ip: string) {
  const volunteer = await getVolunteer(
    volunteerId,
    {}
  )
  if (!volunteer) throw new Error('no volunteer was found to add background info to')
  const volunteerPartnerOrg = volunteer.volunteerPartnerOrg
  if (volunteerPartnerOrg) {
    update.isApproved = true
    await new AccountActionCreator(volunteerId).accountApproved()
    // @todo: if not onboarded, send a partner-specific version of the "approved but not onboarded" email
  }

  // remove fields with empty strings and empty arrays from the update
  for (const field in update) {
    if (
      (Array.isArray(update[field]) && update[field].length === 0) ||
      update[field] === ''
    )
      delete update[field]
  }

  await new AccountActionCreator(
    volunteerId,
    ip
  ).completedBackgroundInfo()
  return VolunteerModel.updateOne({ _id: volunteerId }, update)
}

export async function updateLastActivityUser(userId: Types.ObjectId, lastActivityAt: Date) {
  await UserModel.updateOne({ _id: userId }, { lastActivityAt })
}

export async function adminUpdateUser(
  userId: Types.ObjectId,
  firstName: string,
  lastName: string,
  email: string,
  partnerOrg: string,
  partnerSite: string,
  isVerified: boolean,
  isBanned: boolean,
  isDeactivated: boolean,
  isApproved: boolean
) {
  const userBeforeUpdate = await getUser({ _id: userId }, {})
  if (!userBeforeUpdate) {
    throw new Error('user before update is null')
  }
  const { isVolunteer } = userBeforeUpdate
  const isUpdatedEmail = userBeforeUpdate.email !== email

  // Remove the contact associated with the previous email from SendGrid
  if (isUpdatedEmail) {
    const contact = await MailService.searchContact(userBeforeUpdate.email)
    if (contact) await MailService.deleteContact(contact.id)
  }

  // if unbanning student, also unban their IP addresses
  if (!isVolunteer && userBeforeUpdate.isBanned && !isBanned)
    await IpAddressService.unbanUserIps(userBeforeUpdate)

  if (!userBeforeUpdate.isBanned && isBanned)
    await MailService.sendBannedUserAlert(
      userId.toString(),
      USER_BAN_REASON.ADMIN,
    ''
    )

  const update = {
    firstname: firstName,
    lastname: lastName,
    email,
    verified: isVerified,
    isBanned,
    isDeactivated,
    isApproved,
    volunteerPartnerOrg,
    $unset: {
      volunteerPartnerOrg
    }
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
  }

  if (isBanned) update.banReason = USER_BAN_REASON.ADMIN
  if (isDeactivated && !userBeforeUpdate.isDeactivated)
    await new AdminActionCreator(userId.toString()).adminDeactivatedAccount()

  // Remove $unset property if it has no properties to remove
  if (Object.keys(update.$unset).length === 0) delete update.$unset

  const updatedUser = Object.assign(userBeforeUpdate, update)
  await MailService.createContact(updatedUser)

  if (isVolunteer) {
    return VolunteerModel.updateOne({ _id: userId }, update)
  } else {
    return StudentModel.updateOne({ _id: userId }, update)
  }
}

export async function getUsers(
  userId: string,
  firstName: string,
  lastName: string,
  email: string,
  partnerOrg: string,
  highSchool: string,
  page: string
) {
  const query: any = {}
  const pageNum = parseInt(page) || 1
  const PER_PAGE = 15
  const skip = (pageNum - 1) * PER_PAGE

  if (userId) query._id = new ObjectId(userId)
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
        as: 'highSchool'
      }
    },
    {
      $unwind: '$highSchool'
    },
    {
      $match: {
        $or: [
          { 'highSchool.nameStored': { $regex: highSchool, $options: 'i' } },
          { 'highSchool.SCH_NAME': { $regex: highSchool, $options: 'i' } }
        ]
      }
    }
  ]

  const aggregateQuery: any[] = [{ $match: query }]
  if (highSchool) aggregateQuery.push(...highSchoolQuery)

  try {
    const users = await UserModel.aggregate(aggregateQuery)
      .skip(skip)
      .limit(PER_PAGE)
      .exec()

    const isLastPage = users.length < PER_PAGE
    return { users, isLastPage }
  } catch (error) {
    throw new Error(error.message)
  }
}

// @note: this query is making a request for user data on every page transition
//        for new pastSessions to display. May be better served as a separate
//        service method for getting the user's past sessions
export async function adminGetUser(userId: string, page: number) {
  const [results] = await UserModel.aggregate([
    {
      $match: {
        _id: new ObjectId(userId)
      }
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
        pastSessions: { $slice: ['$pastSessions', -10 * page, 10] }
      }
    },
    {
      $facet: {
        user: [
          {
            $lookup: {
              from: 'schools',
              localField: 'approvedHighschool',
              foreignField: '_id',
              as: 'approvedHighschool'
            }
          },
          {
            $unwind: {
              path: '$approvedHighschool',
              preserveNullAndEmptyArrays: true
            }
          }
        ],
        pastSessions: [
          {
            $unwind: {
              path: '$pastSessions'
            }
          },
          {
            $lookup: {
              from: 'sessions',
              let: {
                sessionId: '$pastSessions'
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$_id', '$$sessionId']
                    }
                  }
                },
                {
                  $project: {
                    type: 1,
                    subTopic: 1,
                    totalMessages: {
                      $size: '$messages'
                    },
                    volunteer: 1,
                    student: 1,
                    volunteerJoinedAt: 1,
                    createdAt: 1,
                    endedAt: 1
                  }
                }
              ],
              as: 'pastSessions'
            }
          },
          {
            $unwind: {
              path: '$pastSessions'
            }
          },
          {
            $replaceRoot: {
              newRoot: '$pastSessions'
            }
          }
        ]
      }
    }
  ])

  return {
    ...results.user[0],
    pastSessions: results.pastSessions
  }
}

// @todo: move to repo layer once this is converted to TS
export async function addPastSession(userId: Types.ObjectId, sessionId: Types.ObjectId) {
  const query = { _id: userId }
  const update = { $addToSet: { pastSessions: sessionId } }
  try {
    await UserModel.updateOne(query, update)
  } catch (error) {
    throw new DocUpdateError(error, query, update)
  }
}


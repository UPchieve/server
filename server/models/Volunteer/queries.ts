import { Types } from 'mongoose'
import config from '../../config'
import {
  MATH_SUBJECTS,
  PHOTO_ID_STATUS,
  READING_WRITING_SUBJECTS,
  REFERENCE_STATUS,
  SAT_SUBJECTS,
  SCIENCE_SUBJECTS,
} from '../../constants'
import { EMAIL_RECIPIENT } from '../../utils/aggregation-snippets'
import { Availability } from '../Availability/types'
import { RepoReadError, RepoUpdateError } from '../Errors'
import NotificationModel from '../Notification'
import VolunteerModel, { Volunteer } from './index'

/**
 * Wraps a db read to throw a RepoReadError if anything went wrong
 * @param fn Function db read to execute
 * @returns Result of db read
 */
async function wrapRead<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    throw new RepoReadError(err)
  }
}

// TODO: THIS SHOULD NOT BE USED (reportutils) - use custom getter for pipelines
export async function getVolunteersWithPipeline(pipeline: any): Promise<any> {
  return await VolunteerModel.aggregate(pipeline)
}

// TODO: this should not be used (emailReference) - use a custom getter
export async function getVolunteers(query: any = {}): Promise<Volunteer[]> {
  return await wrapRead(async () => {
    return await VolunteerModel.find(query)
      .lean()
      .exec()
  })
}

export async function getAllVolunteers(): Promise<Volunteer[]> {
  return await wrapRead(async () => {
    return await VolunteerModel.find()
      .lean()
      .exec()
  })
}

export async function getVolunteerById(
  volunteerId: Types.ObjectId
): Promise<Volunteer | undefined> {
  return await wrapRead(async () => {
    const volunteer = await VolunteerModel.findOne({ _id: volunteerId })
      .lean()
      .exec()
    if (volunteer) return volunteer as Volunteer
  })
}

export type VolunteerContactInfo = Pick<
  Volunteer,
  '_id' | 'email' | 'phone' | 'firstname' | 'volunteerPartnerOrg'
>
const CONTACT_INFO_PROJECTION = {
  _id: 1,
  firstname: 1,
  email: 1,
  volunteerPartnerOrg: 1,
  phone: 1,
}
export async function getVolunteerContactInfoById(
  volunteerId: Types.ObjectId
): Promise<VolunteerContactInfo | undefined> {
  return await wrapRead(async () => {
    const volunteer = await VolunteerModel.findOne(
      {
        ...EMAIL_RECIPIENT,
        _id: volunteerId,
      },
      CONTACT_INFO_PROJECTION
    )
      .lean()
      .exec()
    if (volunteer) return volunteer as VolunteerContactInfo
  })
}
// TODO: proper type for query
export async function getVolunteersContactInfo(
  query: any
): Promise<VolunteerContactInfo[]> {
  return await wrapRead(async () => {
    return await VolunteerModel.find(
      {
        ...EMAIL_RECIPIENT,
        ...query,
      },
      CONTACT_INFO_PROJECTION
    )
      .lean()
      .exec()
  })
}

export async function getVolunteersForBlackoutOver(
  startDate: Date
): Promise<VolunteerContactInfo[]> {
  return await wrapRead(async () => {
    return await VolunteerModel.find(
      {
        ...EMAIL_RECIPIENT,
        sentInactiveNinetyDayEmail: false,
        lastActivityAt: {
          $lt: startDate,
        },
      },
      CONTACT_INFO_PROJECTION
    )
      .lean()
      .exec()
  })
}

export async function getVolunteersFailsafe(): Promise<VolunteerContactInfo[]> {
  try {
    return (await VolunteerModel.find(
      { isFailsafeVolunteer: true },
      CONTACT_INFO_PROJECTION
    )
      .lean()
      .exec()) as VolunteerContactInfo[]
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type VolunteerContactAndAvailability = VolunteerContactInfo &
  Pick<Volunteer, 'availability'>
export async function getVolunteerForQuickTips(
  volunteerId: Types.ObjectId
): Promise<VolunteerContactAndAvailability | undefined> {
  return await wrapRead(async () => {
    const volunteer = await VolunteerModel.findOne(
      {
        ...EMAIL_RECIPIENT,
        isOnboarded: true,
        _id: volunteerId,
      },
      {
        ...CONTACT_INFO_PROJECTION,
        availability: 1,
      }
    )
      .lean()
      .exec()
    if (volunteer) return volunteer as Volunteer
  })
}
export async function getPartnerVolunteerForLowHours(
  volunteerId: Types.ObjectId
): Promise<VolunteerContactAndAvailability | undefined> {
  return await wrapRead(async () => {
    const volunteer = await VolunteerModel.findOne(
      {
        _id: volunteerId,
        isOnboarded: true,
        'pastSessions.1': { $exists: false },
        volunteerPartnerOrg: { $exists: true },
        ...EMAIL_RECIPIENT,
      },
      {
        ...CONTACT_INFO_PROJECTION,
        availability: 1,
      }
    )
      .lean()
      .exec()
    if (volunteer) return volunteer as Volunteer
  })
}
export async function getPartnerVolunteerForCollege(
  volunteerId: Types.ObjectId
): Promise<VolunteerContactAndAvailability | undefined> {
  return await wrapRead(async () => {
    const volunteer = await VolunteerModel.findOne(
      {
        _id: volunteerId,
        isOnboarded: true,
        subjects: {
          $nin: Object.values({
            ...MATH_SUBJECTS,
            ...SCIENCE_SUBJECTS,
            ...SAT_SUBJECTS,
            ...READING_WRITING_SUBJECTS,
          }),
        },
        volunteerPartnerOrg: { $exists: true },
        ...EMAIL_RECIPIENT,
      },
      {
        _id: 1,
        email: 1,
        firstname: 1,
        availability: 1,
      }
    )
      .lean()
      .exec()
    if (volunteer) return volunteer as Volunteer
  })
}

export type VolunteerForWeeklyHourSummary = VolunteerContactInfo &
  Pick<
    Volunteer,
    'sentHourSummaryIntroEmail' | 'volunteerPartnerOrg' | 'certifications'
  >
export async function getVolunteersForWeeklyHourSummary(
  unsubscribedPartners: string[]
): Promise<VolunteerForWeeklyHourSummary[]> {
  return await wrapRead(async () => {
    return await VolunteerModel.find(
      {
        ...EMAIL_RECIPIENT,
        volunteerPartnerOrg: { $nin: unsubscribedPartners },
      },
      {
        firstname: 1,
        email: 1,
        sentHourSummaryIntroEmail: 1,
        volunteerPartnerOrg: 1,
        certifications: 1,
      }
    )
      .lean()
      .exec()
  })
}
export async function updateVolunteerHourSummaryIntroById(
  volunteerId: Types.ObjectId,
  sentHourSummaryIntroEmail: boolean
): Promise<void> {
  try {
    const result = await VolunteerModel.updateOne(
      { _id: volunteerId },
      {
        sentHourSummaryIntroEmail,
      }
    ).exec()
    if (!result.ok)
      throw new RepoUpdateError('Update query did not return "ok"')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function getVolunteerIdsForElapsedAvailability(): Promise<
  Types.ObjectId[]
> {
  return await wrapRead(async () => {
    const volunteers = await VolunteerModel.find(
      {
        isOnboarded: true,
        isApproved: true,
      },
      {
        _id: 1,
      }
    )
      .lean()
      .exec()
    return volunteers.map(v => v._id)
  })
}

export type VolunteerForHourSummary = Pick<Volunteer, '_id' | 'certifications'>
export async function getVolunteersForTotalHours(): Promise<
  VolunteerForHourSummary[]
> {
  return await wrapRead(async () => {
    return await VolunteerModel.find(
      {
        isTestUser: false,
        isFakeUser: false,
        volunteerPartnerOrg: {
          $in: config.customVolunteerPartnerOrgs,
        },
        isOnboarded: true,
        isApproved: true,
      },
      {
        _id: 1,
        certifications: 1,
      }
    )
      .lean()
      .exec()
  })
}

export type VolunteerForOnboarding = Pick<
  Volunteer,
  'certifications' | 'subjects' | 'availabilityLastModifiedAt' | 'country'
> &
  VolunteerContactInfo
export async function getVolunteerForOnboardingById(
  volunteerId: Types.ObjectId
): Promise<VolunteerForOnboarding | undefined> {
  try {
    const volunteer = await VolunteerModel.findOne(
      {
        _id: volunteerId,
        isOnboarded: false,
        ...EMAIL_RECIPIENT,
      },
      {
        _id: 1,
        email: 1,
        firstname: 1,
        isOnboarded: 1,
        certifications: 1,
        subjects: 1,
        availabilityLastModifiedAt: 1,
        country: 1,
      }
    )
      .lean()
      .exec()
    if (volunteer) return volunteer as VolunteerForOnboarding
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type VolunteerForTelecomReport = Pick<
  Volunteer,
  'firstname' | 'lastname' | 'email'
> &
  VolunteerForHourSummary
export async function getVolunteersForTelecomReport(
  customVolunteerPartnerOrg: string
): Promise<VolunteerForTelecomReport[]> {
  return await wrapRead(async () => {
    return await VolunteerModel.find(
      {
        isTestUser: false,
        isFakeUser: false,
        volunteerPartnerOrg: customVolunteerPartnerOrg,
        isOnboarded: true,
        isApproved: true,
      },
      {
        _id: 1,
        createdAt: 1,
        firstname: 1,
        lastname: 1,
        email: 1,
        certifications: 1,
      }
    )
      .lean()
      .exec()
  })
}

export async function getVolunteersNotifiedSinceDate(
  sinceDate: Date
): Promise<Types.ObjectId[]> {
  try {
    const notifications = await NotificationModel.find({
      sentAt: { $gt: sinceDate },
    })
      .select('volunteer')
      .lean()
      .exec()

    return notifications.map(notif => notif.volunteer as Types.ObjectId)
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getVolunteersNotifiedBySessionId(
  sessionId: Types.ObjectId
): Promise<Types.ObjectId[]> {
  try {
    const notifications = await NotificationModel.find({ sessionId: sessionId })
      .select('volunteer')
      .lean()
      .exec()

    return notifications.map(notif => notif.volunteer as Types.ObjectId)
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getVolunteerByReference(
  referenceId: Types.ObjectId
): Promise<Volunteer | undefined> {
  try {
    const volunteer = await VolunteerModel.findOne({
      'references._id': referenceId,
    })
      .lean()
      .exec()
    if (volunteer) return volunteer as Volunteer
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getVolunteersOnDeck(
  subject: string,
  excludedVolunteerIds: Types.ObjectId[],
  availabilityPath: string
): Promise<Pick<Volunteer, '_id'>[]> {
  try {
    const volunteers = await VolunteerModel.find(
      {
        subjects: subject,
        _id: { $nin: excludedVolunteerIds },
        [availabilityPath]: true,
      },
      { _id: 1 }
    )
      .lean()
      .exec()
    return volunteers
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export interface ReferenceData {
  firstName: string
  lastName: string
  email: string
}
export async function addVolunteerReferenceById(
  volunteerId: Types.ObjectId,
  reference: ReferenceData
): Promise<void> {
  try {
    const result = await VolunteerModel.updateOne(
      { _id: volunteerId },
      { $push: { references: reference } }
    ).exec()
    if (!result.ok)
      throw new RepoUpdateError('Update query did not return "ok"')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export interface InactiveVolunteersAggregation {
  inactiveThirtyDays: Volunteer[]
  inactiveSixtyDays: Volunteer[]
  inactiveNinetyDays: Volunteer[]
}
export async function getInactiveVolunteers(
  thirtyDaysAgoStartOfDay: Date,
  thirtyDaysAgoEndOfDay: Date,
  sixtyDaysAgoStartOfDay: Date,
  sixtyDaysAgoEndOfDay: Date,
  ninetyDaysAgoStartOfDay: Date,
  ninetyDaysAgoEndOfDay: Date
): Promise<InactiveVolunteersAggregation> {
  try {
    const thirtyDaysAgoQuery = {
      sentInactiveThirtyDayEmail: false,
      lastActivityAt: {
        $gte: new Date(thirtyDaysAgoStartOfDay),
        $lt: new Date(thirtyDaysAgoEndOfDay),
      },
    }
    const sixtyDaysAgoQuery = {
      sentInactiveSixtyDayEmail: false,
      lastActivityAt: {
        $gte: new Date(sixtyDaysAgoStartOfDay),
        $lt: new Date(sixtyDaysAgoEndOfDay),
      },
    }
    const ninetyDaysAgoQuery = {
      sentInactiveNinetyDayEmail: false,
      lastActivityAt: {
        $gte: new Date(ninetyDaysAgoStartOfDay),
        $lt: new Date(ninetyDaysAgoEndOfDay),
      },
    }
    const [agg] = ((await getVolunteersWithPipeline([
      {
        $match: {
          $or: [thirtyDaysAgoQuery, sixtyDaysAgoQuery, ninetyDaysAgoQuery],
          ...EMAIL_RECIPIENT,
        },
      },
      {
        $group: {
          _id: null,
          inactiveThirtyDays: {
            $push: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$lastActivityAt', thirtyDaysAgoStartOfDay] },
                    { $lt: ['$lastActivityAt', thirtyDaysAgoEndOfDay] },
                  ],
                },
                '$$ROOT',
                '$$REMOVE',
              ],
            },
          },
          inactiveSixtyDays: {
            $push: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$lastActivityAt', sixtyDaysAgoStartOfDay] },
                    { $lt: ['$lastActivityAt', sixtyDaysAgoEndOfDay] },
                  ],
                },
                '$$ROOT',
                '$$REMOVE',
              ],
            },
          },
          inactiveNinetyDays: {
            $push: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$lastActivityAt', ninetyDaysAgoStartOfDay] },
                    { $lt: ['$lastActivityAt', ninetyDaysAgoEndOfDay] },
                  ],
                },
                '$$ROOT',
                '$$REMOVE',
              ],
            },
          },
        },
      },
    ])) as unknown) as InactiveVolunteersAggregation[]
    return agg
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function updateVolunteerReferenceStatusById(
  referenceId: Types.ObjectId,
  sentAt: Date
): Promise<void> {
  try {
    const result = await VolunteerModel.updateOne(
      { 'references._id': referenceId },
      {
        $set: {
          'references.$.status': REFERENCE_STATUS.SENT,
          'references.$.sentAt': sentAt,
        },
      }
    ).exec()
    if (!result.ok)
      throw new RepoUpdateError('Update query did not return "ok"')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function deleteVolunteerReferenceById(
  volunteerId: Types.ObjectId,
  referenceEmail: string
): Promise<void> {
  try {
    const result = await VolunteerModel.updateOne(
      { _id: volunteerId },
      { $pull: { references: { email: referenceEmail } } }
    ).exec()
    if (!result.ok)
      throw new RepoUpdateError('Update query did not return "ok"')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function updateVolunteersReadyToCoachByIds(
  volunteerIds: Types.ObjectId[]
): Promise<void> {
  try {
    const result = await VolunteerModel.updateMany(
      {
        _id: { $in: volunteerIds },
      },
      {
        sentReadyToCoachEmail: true,
      }
    ).exec()
    if (!result.ok)
      throw new RepoUpdateError('Update query did not return "ok"')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function updateVolunteerElapsedAvailabilityById(
  volunteerId: Types.ObjectId,
  elapsedAvailability: number
): Promise<void> {
  try {
    const result = await VolunteerModel.updateOne(
      {
        _id: volunteerId,
      },
      {
        $inc: { elapsedAvailability },
      }
    ).exec()
    if (!result.ok)
      throw new RepoUpdateError('Update query did not return "ok"')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function updateVolunteerTotalHoursById(
  volunteerId: Types.ObjectId,
  update: number
): Promise<void> {
  try {
    const result = await VolunteerModel.updateOne(
      {
        _id: volunteerId,
      },
      {
        $inc: { totalVolunteerHours: update },
      }
    ).exec()
    if (!result.ok)
      throw new RepoUpdateError('Update query did not return "ok"')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function updateVolunteerTrainingById(
  volunteerId: Types.ObjectId,
  courseKey: string,
  isComplete: boolean,
  progress: number,
  materialKey: string
): Promise<void> {
  try {
    const result = await VolunteerModel.updateOne(
      { _id: volunteerId },
      {
        $set: {
          [`trainingCourses.${courseKey}.isComplete`]: isComplete,
          [`trainingCourses.${courseKey}.progress`]: progress,
        },
        $addToSet: {
          [`trainingCourses.${courseKey}.completedMaterials`]: materialKey,
        },
      }
    ).exec()
    if (!result.ok)
      throw new RepoUpdateError('Update query did not return "ok"')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function updateVolunteerPhotoIdById(
  volunteerId: Types.ObjectId,
  photoIdS3Key: string
): Promise<void> {
  try {
    const result = await VolunteerModel.updateOne(
      { _id: volunteerId },
      { $set: { photoIdS3Key, photoIdStatus: PHOTO_ID_STATUS.SUBMITTED } }
    ).exec()
    if (!result.ok)
      throw new RepoUpdateError('Update query did not return "ok"')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function updateVolunteerSentInactiveEmail(
  volunteerId: Types.ObjectId,
  sentInactiveThirtyDayEmail: boolean,
  sentInactiveSixtyDayEmail: boolean
): Promise<void> {
  try {
    const result = await VolunteerModel.updateOne(
      { _id: volunteerId },
      {
        sentInactiveThirtyDayEmail,
        sentInactiveSixtyDayEmail,
      }
    ).exec()
    if (!result.ok)
      throw new RepoUpdateError('Update query did not return "ok"')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function updateVolunteerInactiveAvailability(
  volunteerId: Types.ObjectId,
  availability: Availability
): Promise<void> {
  try {
    const result = await VolunteerModel.updateOne(
      { _id: volunteerId },
      {
        availability,
        sentInactiveNinetyDayEmail: true,
      }
    ).exec()
    if (!result.ok)
      throw new RepoUpdateError('Update query did not return "ok"')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function updateVolunteerProfileById(
  volunteerId: Types.ObjectId,
  isDeactivated?: boolean,
  phone?: string
): Promise<void> {
  try {
    const result = await VolunteerModel.updateOne(
      {
        _id: volunteerId,
      },
      {
        isDeactivated,
        phone,
      }
    ).exec()
    if (!result.ok)
      throw new RepoUpdateError('Update query did not return "ok"')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function updateTimeTutored(
  volunteerId: Types.ObjectId,
  timeTutored: number
) {
  const query = { _id: volunteerId }
  const update = {
    $inc: {
      hoursTutored: Number((timeTutored / 3600000).toFixed(2)),
      timeTutored,
    },
  }
  try {
    await VolunteerModel.updateOne(query, update)
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

import { Types } from 'mongoose'
import VolunteerModel, { Volunteer } from './index'
import { EMAIL_RECIPIENT } from '../../utils/aggregation-snippets'
import { RepoReadError, RepoUpdateError } from '../Errors'
import {
  MATH_SUBJECTS,
  SCIENCE_SUBJECTS,
  SAT_SUBJECTS,
  READING_WRITING_SUBJECTS
} from '../../constants'
import config from '../../config'
import { VolunteerForTelecomReport } from '../../utils/reportUtils'

async function wrapRead<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    throw new RepoReadError(err)
  }
}

// TODO: proper type for query
export async function getVolunteer(query: any): Promise<Volunteer | undefined> {
  return await wrapRead(async () => {
    const volunteer = await VolunteerModel.findOne(query).lean().exec()
    if (volunteer) return volunteer as Volunteer
  })
}

// TODO: proper type for query
export async function getVolunteers(query: any): Promise<Volunteer[]> {
  return await wrapRead(async () => {
    return await VolunteerModel.find(query).lean().exec()
  })
}

export type VolunteerContactInfo = Pick<Volunteer, '_id' | 'email' | 'firstname' | 'volunteerPartnerOrg'>
export async function getVolunteerContactInfoById(volunteerId: Types.ObjectId | string): Promise<VolunteerContactInfo | undefined> {
  return await wrapRead(async () => {
    const volunteer = await VolunteerModel.findOne(
    {
      ...EMAIL_RECIPIENT,
      _id: volunteerId
    },
    {
      _id: 1,
      firstname: 1,
      email: 1
    }).lean().exec()
    if (volunteer) return volunteer as VolunteerContactInfo
  }) 
}
// TODO: proper type for query
export async function getVolunteersContactInfo(query: any): Promise<VolunteerContactInfo[]> {
  return await wrapRead(async () => {
    return await VolunteerModel.find(
    {
      ...EMAIL_RECIPIENT,
      query
    },
    {
      _id: 1,
      firstname: 1,
      email: 1
    }).lean().exec()
  }) 
}

export async function getVolunteersForBlackoutOver(startDate: Date): Promise<VolunteerContactInfo[]> {
  return await wrapRead(async () => {
    return await VolunteerModel.find(
      {
        ...EMAIL_RECIPIENT,
        sentInactiveNinetyDayEmail: false,
        lastActivityAt: {
          $lt: startDate
        }
      },
      {
        _id: 1,
        firstname: 1,
        email: 1
      }
    ).lean().exec()
  })
}

export type VolunteerContactAndAvailability = VolunteerContactInfo & Pick<Volunteer, 'availability'>
export async function getVolunteerForQuickTips(volunteerId: Types.ObjectId | string): Promise<VolunteerContactAndAvailability | undefined> {
  return await wrapRead(async () => {
    const volunteer = await VolunteerModel.findOne(
      {
        ...EMAIL_RECIPIENT,
        isOnboarded: true,
        _id: volunteerId
      },
      {
        _id: 1,
        email: 1,
        firstname: 1,
        availability: 1
      }).lean().exec()
    if (volunteer) return volunteer as Volunteer
  })
}
export async function getPartnerVolunteerForLowHours(volunteerId: Types.ObjectId | string): Promise<VolunteerContactAndAvailability | undefined> {
  return await wrapRead(async () => {
    const volunteer = await VolunteerModel.findOne(
      {
        _id: volunteerId,
        isOnboarded: true,
        'pastSessions.1': { $exists: false },
        volunteerPartnerOrg: { $exists: true },
        ...EMAIL_RECIPIENT
      },
      {
        _id: 1,
        email: 1,
        firstname: 1,
        availability: 1
      }).lean().exec()
    if (volunteer) return volunteer as Volunteer
  })
}
export async function getPartnerVolunteerForCollege(volunteerId: Types.ObjectId | string): Promise<VolunteerContactAndAvailability | undefined> {
  return await wrapRead(async () => {
    const volunteer = await VolunteerModel.findOne(
      {
        _id: volunteerId,
        isOnboarded: true,
        subjects: { $nin: [
          ...Object.values(MATH_SUBJECTS),
          ...Object.values(SCIENCE_SUBJECTS),
          ...Object.values(SAT_SUBJECTS),
          ...Object.values(READING_WRITING_SUBJECTS)
        ]},
        volunteerPartnerOrg: { $exists: true },
        ...EMAIL_RECIPIENT
      },
      {
        _id: 1,
        email: 1,
        firstname: 1,
        availability: 1
      }).lean().exec()
    if (volunteer) return volunteer as Volunteer
  })
}

export type VolunteerForWeeklyHourSummary = VolunteerContactInfo & Pick<Volunteer, 'sentHourSummaryIntroEmail' | 'volunteerPartnerOrg' | 'certifications'>
export async function getVolunteersForWeeklyHourSummary(unsubscribedPartners: string[]): Promise<VolunteerForWeeklyHourSummary[]> {
  return await wrapRead(async () => {
    return await VolunteerModel.find(
      {
        ...EMAIL_RECIPIENT,
        volunteerPartnerOrg: { $nin: unsubscribedPartners }
      },
      {
        firstname: 1,
        email: 1,
        sentHourSummaryIntroEmail: 1,
        volunteerPartnerOrg: 1,
        certifications: 1
      }
    ).lean().exec()
  })
}

export async function getVolunteerIdsForElapsedAvailability(): Promise<Types.ObjectId[]> {
  return await wrapRead(async () => {
    const volunteers = await VolunteerModel.find(
      {
        isOnboarded: true,
        isApproved: true
      },
      {
        _id: 1
      }
    ).lean().exec()
    return volunteers.map(v => v._id)
  })
}

export async function getVolunteersForTotalHours(): Promise<VolunteerForTelecomReport[]> {
  return await wrapRead(async () => {
    return await VolunteerModel.find(
      {
        isTestUser: false,
        isFakeUser: false,
        volunteerPartnerOrg: config.customVolunteerPartnerOrg,
        isOnboarded: true,
        isApproved: true
      },
      {
        _id: 1,
        certifications: 1
      }
    ).lean().exec()
  })
}

export async function updateVolunteersReadyToCoachByIds(volunteerIds: (string | Types.ObjectId)[]): Promise<void> {
  try {
    const result = await VolunteerModel.updateMany(
      {
      _id: { $in: volunteerIds }
      },
      {
        sentReadyToCoachEmail: true
      }
    ).exec()
    if (!result.ok) throw new RepoUpdateError('Update query did not return "ok"')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function updateVolunteerElapsedAvailabilityById(volunteerId: Types.ObjectId | string, elapsedAvailability: number): Promise<void> {
  try {
    const result = await VolunteerModel.updateOne(
      {
        _id: volunteerId,
      },
      {
        $inc: { elapsedAvailability }
      }
    ).exec()
    if (!result.ok) throw new RepoUpdateError('Update query did not return "ok"')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export function updateVolunteerTotalHoursById(volunteerId: Types.ObjectId | string, update: number): Promise<void> {
  try {
    const result = VolunteerModel.updateOne(
      {
        _id: volunteerId
      },
      {
        $inc: { totalVolunteerHours: update },
      }
    ).exec()
    if (!result.ok) throw new RepoUpdateError('Update query did not return "ok"')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}
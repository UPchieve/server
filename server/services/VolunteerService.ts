import { Aggregate, Types, Query } from 'mongoose'
import VolunteerModel, { Volunteer } from '../models/Volunteer'
import { Jobs } from '../worker/jobs'
import { getTimeTutoredForDateRange } from './SessionService'
import { getElapsedAvailabilityForDateRange } from './AvailabilityService'
import { getQuizzesPassedForDateRange } from './UserActionService'
import QueueService from './QueueService'

export const getVolunteers = async (
  query,
  projection = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> =>
  VolunteerModel.find(query)
    .select(projection)
    .lean()
    .exec()

export const getVolunteersWithPipeline = (
  pipeline
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Aggregate<Volunteer[]> => VolunteerModel.aggregate(pipeline)

export const updateVolunteer = (
  query,
  update: Partial<Volunteer>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Query<Volunteer> => VolunteerModel.updateOne(query, update)

export const getHourSummaryStats = async (
  volunteerId: Types.ObjectId | string,
  fromDate: Date,
  toDate: Date
): Promise<{
  totalCoachingHours: number
  totalQuizzesPassed: number
  totalElapsedAvailability: number
  totalVolunteerHours: number
}> => {
  // @todo: promise.all fails fast, do we want this? - handle error
  const [
    quizzesPassed,
    elapsedAvailability,
    timeTutoredMS
  ] = await Promise.all([
    getQuizzesPassedForDateRange(volunteerId, fromDate, toDate),
    getElapsedAvailabilityForDateRange(volunteerId, fromDate, toDate),
    getTimeTutoredForDateRange(volunteerId, fromDate, toDate)
  ])

  const timeTutoredInHours = Number(timeTutoredMS / 3600000).toFixed(2)
  const totalCoachingHours = Number(timeTutoredInHours)
  // Total volunteer hours calculation: [sum of coaching, elapsed avail/10, and quizzes]
  const totalVolunteerHours = Number(
    totalCoachingHours + quizzesPassed.length + elapsedAvailability * 0.1
  ).toFixed(2)
  return {
    totalCoachingHours,
    totalQuizzesPassed: quizzesPassed.length,
    totalElapsedAvailability: elapsedAvailability,
    totalVolunteerHours: Number(totalVolunteerHours)
  }
}

export const queueOnboardingReminderOneEmail = async (
  volunteerId: string | Types.ObjectId
): Promise<void> => {
  const sevenDaysInMs = 1000 * 60 * 60 * 24 * 7
  QueueService.add(
    Jobs.EmailOnboardingReminderOne,
    { volunteerId },
    { delay: sevenDaysInMs }
  )
}

export const queueOnboardingEventEmails = async (
  volunteerId: string | Types.ObjectId
): Promise<void> => {
  QueueService.add(
    Jobs.EmailVolunteerQuickTips,
    { volunteerId },
    // process job 5 days after the volunteer is onboarded
    { delay: 1000 * 60 * 60 * 24 * 5 }
  )
}

export const queuePartnerOnboardingEventEmails = async (
  volunteerId: string | Types.ObjectId
): Promise<void> => {
  QueueService.add(
    Jobs.EmailPartnerVolunteerLowHoursSelected,
    { volunteerId },
    // process job 10 days after the volunteer is onboarded
    { delay: 1000 * 60 * 60 * 24 * 10 }
  )
  QueueService.add(
    Jobs.EmailPartnerVolunteerOnlyCollegeCerts,
    { volunteerId },
    // process job 15 days after the volunteer is onboarded
    { delay: 1000 * 60 * 60 * 24 * 15 }
  )
}

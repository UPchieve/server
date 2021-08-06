import moment from 'moment-timezone'
import { Jobs } from '..'
import logger from '../../../logger'
import { Volunteer } from '../../../models/Volunteer'
import { updateAvailabilitySnapshot } from '../../../services/AvailabilityService'
import MailService from '../../../services/MailService'
import {
  getVolunteersWithPipeline,
  updateVolunteer
} from '../../../services/VolunteerService'
import { EMAIL_RECIPIENT } from '../../../utils/aggregation-snippets'
import createNewAvailability from '../../../utils/create-new-availability'

interface InactiveVolunteersAggregation {
  inactiveThirtyDays: Volunteer[]
  inactiveSixtyDays: Volunteer[]
  inactiveNinetyDays: Volunteer[]
}

enum InactiveGroup {
  inactiveThirtyDays = 'inactiveThirtyDays',
  inactiveSixtyDays = 'inactiveSixtyDays',
  inactiveNinetyDays = 'inactiveNinetyDays'
}

async function sendEmailToInactiveVolunteers({
  volunteers,
  currentJob,
  mailHandler,
  group
}) {
  for (const volunteer of volunteers) {
    const { email, firstname: firstName, _id } = volunteer
    const errors = []
    try {
      const contactInfo = { email, firstName }
      await mailHandler(contactInfo)
      if (group === InactiveGroup.inactiveThirtyDays)
        await updateVolunteer({ _id }, { sentInactiveThirtyDayEmail: true })
      if (group === InactiveGroup.inactiveSixtyDays)
        await updateVolunteer({ _id }, { sentInactiveSixtyDayEmail: true })
      if (group === InactiveGroup.inactiveNinetyDays) {
        const clearedAvailability = createNewAvailability()
        await updateVolunteer(
          { _id },
          {
            availability: clearedAvailability,
            sentInactiveNinetyDayEmail: true
          }
        )
        await updateAvailabilitySnapshot(_id, {
          onCallAvailability: clearedAvailability
        })
      }
      logger.info(`Sent ${currentJob} to volunteer ${_id}`)
    } catch (error) {
      errors.push(`${currentJob} to volunteer ${_id}: ${error}`)
    }
    if (errors.length) {
      throw errors
    }
  }
}

function getLastActivityAtQuery(fromDate: Date, toDate: Date) {
  return {
    // best practice to clone date objects to avoid multiple ownership
    $gte: new Date(fromDate),
    $lt: new Date(toDate)
  }
}

function getStartOfDayFromDaysAgo(daysAgo: number): Date {
  return moment()
    .utc()
    .subtract(daysAgo, 'days')
    .startOf('day')
    .toDate()
}

function getEndOfDayFromDaysAgo(daysAgo: number): Date {
  return moment()
    .utc()
    .subtract(daysAgo, 'days')
    .endOf('day')
    .toDate()
}

export default async (): Promise<void> => {
  const blackoutPeriodStart = moment()
    .utc()
    .month('June')
    .startOf('month')
    .toDate()
    .getTime()
  const blackoutPeriodEnd = moment()
    .utc()
    .month('September')
    .date(1)
    .endOf('day')
    .toDate()
    .getTime()
  const todaysDate = new Date().getTime()
  if (todaysDate >= blackoutPeriodStart && todaysDate <= blackoutPeriodEnd) {
    logger.info(
      `Skipping ${Jobs.EmailVolunteerInactive} because today's date, ${new Date(
        todaysDate
      ).toISOString()}, is within the blackout period: ${new Date(
        blackoutPeriodStart
      ).toISOString()} - ${new Date(blackoutPeriodEnd).toISOString()}`
    )
    return
  }

  const thirtyDaysAgoStartOfDay = getStartOfDayFromDaysAgo(30)
  const thirtyDaysAgoEndOfDay = getEndOfDayFromDaysAgo(30)
  const sixtyDaysAgoStartOfDay = getStartOfDayFromDaysAgo(60)
  const sixtyDaysAgoEndOfDay = getEndOfDayFromDaysAgo(60)
  const ninetyDaysAgoStartOfDay = getStartOfDayFromDaysAgo(90)
  const ninetyDaysAgoEndOfDay = getEndOfDayFromDaysAgo(90)
  const thirtyDaysAgoQuery = {
    sentInactiveThirtyDayEmail: false,
    lastActivityAt: getLastActivityAtQuery(
      thirtyDaysAgoStartOfDay,
      thirtyDaysAgoEndOfDay
    )
  }
  const sixtyDaysAgoQuery = {
    sentInactiveSixtyDayEmail: false,
    lastActivityAt: getLastActivityAtQuery(
      sixtyDaysAgoStartOfDay,
      sixtyDaysAgoEndOfDay
    )
  }
  const ninetyDaysAgoQuery = {
    sentInactiveNinetyDayEmail: false,
    lastActivityAt: getLastActivityAtQuery(
      ninetyDaysAgoStartOfDay,
      ninetyDaysAgoEndOfDay
    )
  }

  // TODO: can't be properly typed due to aggregation wrapper
  const [volunteers]: unknown[] = await getVolunteersWithPipeline([
    {
      $match: {
        $or: [thirtyDaysAgoQuery, sixtyDaysAgoQuery, ninetyDaysAgoQuery],
        ...EMAIL_RECIPIENT
      }
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
                  { $lt: ['$lastActivityAt', thirtyDaysAgoEndOfDay] }
                ]
              },
              '$$ROOT',
              '$$REMOVE'
            ]
          }
        },
        inactiveSixtyDays: {
          $push: {
            $cond: [
              {
                $and: [
                  { $gt: ['$lastActivityAt', sixtyDaysAgoStartOfDay] },
                  { $lt: ['$lastActivityAt', sixtyDaysAgoEndOfDay] }
                ]
              },
              '$$ROOT',
              '$$REMOVE'
            ]
          }
        },
        inactiveNinetyDays: {
          $push: {
            $cond: [
              {
                $and: [
                  { $gt: ['$lastActivityAt', ninetyDaysAgoStartOfDay] },
                  { $lt: ['$lastActivityAt', ninetyDaysAgoEndOfDay] }
                ]
              },
              '$$ROOT',
              '$$REMOVE'
            ]
          }
        }
      }
    }
  ])

  if (volunteers) {
    const {
      inactiveThirtyDays,
      inactiveSixtyDays,
      inactiveNinetyDays
    } = volunteers as InactiveVolunteersAggregation
    const errors = []
    try {
      await sendEmailToInactiveVolunteers({
        volunteers: inactiveThirtyDays,
        currentJob: Jobs.EmailVolunteerInactiveThirtyDays,
        mailHandler: MailService.sendVolunteerInactiveThirtyDays,
        group: InactiveGroup.inactiveThirtyDays
      })
    } catch (error) {
      errors.push(...error)
    }
    try {
      await sendEmailToInactiveVolunteers({
        volunteers: inactiveSixtyDays,
        currentJob: Jobs.EmailVolunteerInactiveSixtyDays,
        mailHandler: MailService.sendVolunteerInactiveSixtyDays,
        group: InactiveGroup.inactiveSixtyDays
      })
    } catch (error) {
      errors.push(...error)
    }
    try {
      await sendEmailToInactiveVolunteers({
        volunteers: inactiveNinetyDays,
        currentJob: Jobs.EmailVolunteerInactiveNinetyDays,
        mailHandler: MailService.sendVolunteerInactiveNinetyDays,
        group: InactiveGroup.inactiveNinetyDays
      })
    } catch (error) {
      errors.push(...error)
    }
    if (errors.length) {
      throw new Error(`Failed to send inactivity emails: ${errors}`)
    }
  }
}

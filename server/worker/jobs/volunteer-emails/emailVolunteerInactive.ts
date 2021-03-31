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
    try {
      const contactInfo = { email, firstName }
      await mailHandler(contactInfo)
      if (group === InactiveGroup.inactiveNinetyDays) {
        const clearedAvailability = createNewAvailability()
        await updateVolunteer({ _id }, { availability: clearedAvailability })
        await updateAvailabilitySnapshot(_id, {
          onCallAvailability: clearedAvailability
        })
      }
      logger.info(`Sent ${currentJob} to volunteer ${_id}`)
    } catch (error) {
      logger.error(`Failed to send ${currentJob} to volunteer ${_id}: ${error}`)
    }
  }
}

function getLastActivityAtQuery(fromDate, toDate) {
  return {
    lastActivityAt: {
      $gte: new Date(fromDate),
      $lt: new Date(toDate)
    }
  }
}

function getStartOfDayFromDaysAgo(daysAgo) {
  return new Date(
    moment()
      .utc()
      .subtract(daysAgo, 'days')
      .startOf('day')
  )
}

function getEndOfDayFromDaysAgo(daysAgo) {
  return new Date(
    moment()
      .utc()
      .subtract(daysAgo, 'days')
      .endOf('day')
  )
}

export default async (): Promise<void> => {
  const thirtyDaysAgoStartOfDay = getStartOfDayFromDaysAgo(30)
  const thirtyDaysAgoEndOfDay = getEndOfDayFromDaysAgo(30)
  const sixtyDaysAgoStartOfDay = getStartOfDayFromDaysAgo(60)
  const sixtyDaysAgoEndOfDay = getEndOfDayFromDaysAgo(60)
  const ninetyDaysAgoStartOfDay = getStartOfDayFromDaysAgo(90)
  const ninetyDaysAgoEndOfDay = getEndOfDayFromDaysAgo(90)
  const thirtyDaysAgoQuery = getLastActivityAtQuery(
    thirtyDaysAgoStartOfDay,
    thirtyDaysAgoEndOfDay
  )
  const sixtyDaysAgoQuery = getLastActivityAtQuery(
    sixtyDaysAgoStartOfDay,
    sixtyDaysAgoEndOfDay
  )
  const ninetyDaysAgoQuery = getLastActivityAtQuery(
    ninetyDaysAgoStartOfDay,
    ninetyDaysAgoEndOfDay
  )

  // @todo: properly type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [volunteers]: any = await getVolunteersWithPipeline([
    {
      $match: {
        $or: [thirtyDaysAgoQuery, sixtyDaysAgoQuery, ninetyDaysAgoQuery]
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
    await sendEmailToInactiveVolunteers({
      volunteers: inactiveThirtyDays,
      currentJob: Jobs.EmailVolunteerInactiveThirtyDays,
      mailHandler: MailService.sendVolunteerInactiveThirtyDays,
      group: InactiveGroup.inactiveThirtyDays
    })

    await sendEmailToInactiveVolunteers({
      volunteers: inactiveSixtyDays,
      currentJob: Jobs.EmailVolunteerInactiveSixtyDays,
      mailHandler: MailService.sendVolunteerInactiveSixtyDays,
      group: InactiveGroup.inactiveSixtyDays
    })

    await sendEmailToInactiveVolunteers({
      volunteers: inactiveNinetyDays,
      currentJob: Jobs.EmailVolunteerInactiveNinetyDays,
      mailHandler: MailService.sendVolunteerInactiveNinetyDays,
      group: InactiveGroup.inactiveNinetyDays
    })
  }
}

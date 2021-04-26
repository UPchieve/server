import moment from 'moment-timezone'
import { Types } from 'mongoose'
import { capitalize } from 'lodash'
import { USER_ACTION, HOUR_TO_UTC_MAPPING } from '../constants'
import * as UserActionService from '../services/UserActionService'
import SessionService from '../services/SessionService'
import * as AvailabilityService from '../services/AvailabilityService'
import logger from '../logger'
import countCerts from './count-certs'
import roundUpToNearestInterval from './round-up-to-nearest-interval'

interface Stamp {
  day: string
  hour: string
}

function formatStamp(time: moment): Stamp {
  return { day: time.format('MM-DD-YYYY'), hour: time.format('H') }
}

function addToAcc(acc, time: moment, minutes: number): void {
  const { day, hour } = formatStamp(time)
  if (day in acc) {
    const sub = acc[day]
    if (hour in sub) {
      sub[hour] += minutes
    } else {
      sub[hour] = minutes
    }
  } else {
    acc[day] = { hour: minutes }
  }
}

function readFromAcc(acc, time: moment): number {
  const { day, hour } = formatStamp(time)
  if (day in acc) {
    const sub = acc[day]
    if (hour in sub) {
      return sub[hour]
    }
  }
  return 0
}

function telecomTutorTime(
  sessions,
  availabilityForDateRange,
  quizPassedActions
) {
  const acc = {} // accumulator { MM-DD-YYYY: {H: time volunteered in minutes } }

  // TODO: double loop on sessions is ugly and inefficient
  // check if tutoring occured on a day
  for (const session of sessions) {
    const startedAt = moment(session.volunteerJoinedAt).tz('America/New_York')
    acc[startedAt.format('MM-DD-YYYY')] = {}
  }
  // Add time spent on call per availability hour
  for (const availabilityHistory of availabilityForDateRange) {
    const availability = availabilityHistory.availability
    for (const hourA of Object.keys(availability)) {
      if (availability[hourA]) {
        const temp = moment(availabilityHistory.date)
        const { day, hour } = formatStamp(temp.hour(HOUR_TO_UTC_MAPPING[hourA]))
        // If day is not aleady accounted for do not add since no tutoring happened
        if (day in acc) {
          acc[day][hour] = 60
        }
      }
    }
  }
  // Add time spent in tutoring sessions
  for (const session of sessions) {
    if (session.timeTutored === 0) continue
    const startedAt = moment(session.volunteerJoinedAt).tz('America/New_York')
    const endedAt = moment(session.endedAt).tz('America/New_York')
    let counter = moment(startedAt)
    let contribution = 0
    while (counter < endedAt) {
      // Move counter up to the next hour per iteration
      // Add to the accumulator the number of minutes traversed
      // If we would have passed 'endedAt' traverse minutes until endedAt
      let offset = 60 - counter.minutes()
      const nextHour = moment(counter).add(offset, 'minutes')
      if (nextHour > endedAt) {
        offset = endedAt.minutes() - counter.minutes()
      }
      // Do not add contribution if hour block already set to 60 by availability
      if (readFromAcc(acc, counter) < 60) contribution += offset
      counter = nextHour
    }
    // Add extra time to account for rounding duration up to nearest 15
    contribution = roundUpToNearestInterval(contribution, 15)
    addToAcc(acc, startedAt, contribution)
  }
  // Add time spent on certifications
  for (const quizPassed of quizPassedActions) {
    const createdAt = moment(quizPassed.createdAt).tz('America/New_York')
    // No need to check for tutoring/availability overlap according to spec
    addToAcc(acc, createdAt, 60)
  }
  // Reduce accumulator to single day totals
  const final = {}
  for (const day of Object.keys(acc)) {
    let total = 0
    const sub = acc[day]
    for (const hour of Object.keys(sub)) {
      total += sub[hour]
    }
    if (total === 0) continue
    final[day] = Number((total / 60).toFixed(2))
  }
  return final
}

const eventId = 4003

interface TelecomRow {
  mame: string
  email: string
  eventId: number
  date: string
  hours: number
}

async function telecomProcessVolunteer(
  volunteer,
  dateQuery
): Promise<TelecomRow[]> {
  const totalCerts = countCerts(volunteer.certifications)
  if (totalCerts === 0) return []

  // @todo: figure out how the type annotation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const quizPassedActions: any = await UserActionService.getActionsWithPipeline(
    [
      {
        $match: {
          user: Types.ObjectId(volunteer._id),
          action: USER_ACTION.QUIZ.PASSED,
          createdAt: dateQuery
        }
      },
      {
        $sort: {
          createdAt: 1
        }
      }
    ]
  )
  const sessions = await SessionService.getSessionsWithPipeline([
    {
      $sort: {
        createdAt: 1
      }
    },
    {
      $match: {
        volunteer: Types.ObjectId(volunteer._id),
        createdAt: dateQuery
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'student',
        foreignField: '_id',
        as: 'student'
      }
    },
    {
      $unwind: '$student'
    },
    {
      $match: {
        'student.isFakeUser': false,
        'student.isTestUser': false
      }
    },
    {
      $project: {
        _id: 1,
        createdAt: 1,
        endedAt: 1,
        subTopic: 1,
        timeTutored: 1,
        volunteerJoinedAt: 1
      }
    }
  ])
  // @todo: figure out how to properly type and cast
  const availabilityForDateRange: any = await AvailabilityService.getAvailabilityHistoryWithPipeline(
    [
      {
        $match: {
          volunteerId: volunteer._id,
          date: dateQuery
        }
      },
      {
        $sort: {
          date: 1
        }
      }
    ]
  )
  // Accumulate hours into rows
  const rows = []

  const volunteerFirstName = capitalize(volunteer.firstname)
  const volunterLastName = capitalize(volunteer.lastname)
  const name = volunteerFirstName + ' ' + volunterLastName
  const email = volunteer.email
  const accumulatedHours = telecomTutorTime(
    sessions,
    availabilityForDateRange,
    quizPassedActions
  )
  for (const date of Object.keys(accumulatedHours)) {
    const hours = accumulatedHours[date]
    rows.push({
      name,
      email,
      eventId,
      date,
      hours
    })
  }
  return rows
}

export const generateCustomPartnerReport = async (volunteers, dateQuery) => {
  const volunteerPartnerReport = []
  const errors = []
  for (const volunteer of volunteers) {
    try {
      const volunteerRows = await telecomProcessVolunteer(volunteer, dateQuery)
      volunteerPartnerReport.push(...volunteerRows)
    } catch (error) {
      errors.push(`volunteer ${volunteer._id}: ${error}`)
    }
  }
  if (errors.length) {
    throw Error(
      `Failed to generate custom partner report with\n ${errors.join('\n')}`
    )
  }
  logger.info('Telecom report generated')
  return volunteerPartnerReport
}

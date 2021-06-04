import mongoose from 'mongoose'
import { TOTAL_VOLUNTEERS_TO_TEXT_FOR_HELP } from '../../constants'
import {
  resetDb,
  insertSessionWithVolunteer,
  insertSession,
  insertNotificationMany,
  insertVolunteerMany
} from '../db-utils'
import notifyTutors from '../../worker/jobs/notifyTutors'
import config from '../../config'
import TwilioService from '../../services/twilio'
import { buildVolunteer, buildNotification } from '../generate'
import { Jobs } from '../../worker/jobs'
import { log } from '../../worker/logger'
import { Volunteer } from '../../models/Volunteer'
import { Notification } from '../../models/Notification'
import QueueService from '../../services/QueueService'
jest.mock('../../services/twilio')
jest.mock('../../services/QueueService')
jest.mock('../../worker/logger')

jest.setTimeout(15000)

// db connection
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})

beforeEach(async () => {
  await resetDb()
})

const fillNotifications = async (
  amount = TOTAL_VOLUNTEERS_TO_TEXT_FOR_HELP
): Promise<{
  notifications: Notification[]
  volunteers: Volunteer[]
}> => {
  const volunteers = []
  const notifications = []
  for (let i = 0; i < amount; i++) {
    const volunteer = buildVolunteer()
    volunteers.push(volunteer)
    const notification = buildNotification({ volunteer: volunteer._id })
    notifications.push(notification)
  }

  await Promise.all([
    insertVolunteerMany(volunteers),
    insertNotificationMany(notifications)
  ])

  return { notifications, volunteers }
}

describe('Notify tutors', () => {
  beforeEach(async () => {
    jest.resetAllMocks()
  })

  test('Should not notify volunteers when session is fulfilled', async () => {
    const { session } = await insertSessionWithVolunteer()
    // @todo: figure out how to properly type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job: any = {
      data: {
        sessionId: session._id,
        notificationSchedule: config.notificationSchedule
      }
    }

    await notifyTutors(job)
    expect(log).toHaveBeenCalledWith(
      `Cancel ${Jobs.NotifyTutors} for ${session._id}: fulfilled`
    )
    expect(QueueService.add).toHaveBeenCalledTimes(1)
  })

  test('Should not notify volunteers when notification schedule is empty', async () => {
    const { session } = await insertSession()
    // @todo: figure out how to properly type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job: any = {
      data: {
        sessionId: session._id,
        notificationSchedule: []
      },
      queue: {
        add: jest.fn()
      }
    }

    TwilioService.notifyVolunteer = jest.fn(() => null)
    await notifyTutors(job)

    expect(job.queue.add).toHaveBeenCalledTimes(0)
    expect(log).toHaveBeenCalledWith(
      `Unable to ${Jobs.NotifyTutors} for session ${session._id}: no volunteers available`
    )
  })

  test('Should notify volunteers', async () => {
    const { session } = await insertSession()
    // @todo: figure out how to properly type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job: any = {
      data: {
        sessionId: session._id,
        notificationSchedule: [1000, 1000]
      },
      queue: {
        add: jest.fn()
      }
    }
    const volunteer = buildVolunteer()

    TwilioService.notifyVolunteer = jest.fn(() => Promise.resolve(volunteer))
    await notifyTutors(job)

    expect(job.queue.add).toHaveBeenCalledTimes(1)
    expect(job.data.notificationSchedule.length).toBe(1)
    expect(log).toHaveBeenCalledWith(
      `Successfully ${Jobs.NotifyTutors} for session ${session._id}: volunteer ${volunteer._id}`
    )
  })

  test('Should notify a volunteer who has already been texted with a follow-up text once total volunteers to text has been passed', async () => {
    const currentNotificationAmount = 18
    const { notifications, volunteers } = await fillNotifications(
      currentNotificationAmount
    )
    const { session } = await insertSession({ notifications })

    const expectedVolunteerIndex =
      currentNotificationAmount % TOTAL_VOLUNTEERS_TO_TEXT_FOR_HELP

    // @todo: figure out how to properly type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job: any = {
      data: {
        sessionId: session._id,
        notificationSchedule: config.notificationSchedule
      },
      queue: {
        add: jest.fn()
      }
    }

    await notifyTutors(job)
    const expectedVolunteer = volunteers[expectedVolunteerIndex]

    expect(TwilioService.sendFollowupText).toHaveBeenCalledTimes(1)
    expect(log).toHaveBeenCalledWith(
      `Successfully ${Jobs.NotifyTutors} for session ${session._id}: follow-up to volunteer ${expectedVolunteer._id}`
    )
  })
})

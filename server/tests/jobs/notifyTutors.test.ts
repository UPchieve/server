import { mocked } from 'ts-jest/utils'
import mongoose from 'mongoose'
import moment from 'moment'
import { TOTAL_VOLUNTEERS_TO_TEXT_FOR_HELP } from '../../constants'
import {
  resetDb,
  insertSessionWithVolunteer,
  insertSession,
  insertNotificationMany,
  insertVolunteerMany,
} from '../db-utils'
import notifyTutors from '../../worker/jobs/notifyTutors'
import config from '../../config'
import * as TwilioService from '../../services/TwilioService'
import { buildVolunteer, buildNotification } from '../generate'
import { Jobs } from '../../worker/jobs'
import { log } from '../../worker/logger'
import { Volunteer } from '../../models/Volunteer'
import { Notification } from '../../models/Notification'
import QueueService from '../../services/QueueService'
jest.mock('../../services/TwilioService')
jest.mock('../../services/QueueService')
jest.mock('../../worker/logger')

jest.setTimeout(15000)

const mockedTwilioService = mocked(TwilioService, true)

// db connection
beforeAll(async () => {
  await mongoose.connect(global.__MONGO_URI__, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
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
    insertNotificationMany(notifications),
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

    const job: any = {
      data: {
        sessionId: session._id,
        notificationSchedule: config.notificationSchedule,
      },
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

    const job: any = {
      data: {
        sessionId: session._id,
        notificationSchedule: [],
      },
      queue: {
        add: jest.fn(),
      },
    }

    mockedTwilioService.notifyVolunteer.mockResolvedValueOnce(undefined)

    await notifyTutors(job)

    expect(job.queue.add).toHaveBeenCalledTimes(0)
    expect(log).toHaveBeenCalledWith(
      `Unable to send notification for session ${session._id}: no volunteers available`
    )
  })

  test('Should notify volunteers', async () => {
    const { session } = await insertSession()
    // @todo: figure out how to properly type

    const job: any = {
      data: {
        sessionId: session._id,
        notificationSchedule: [1000, 1000],
      },
      queue: {
        add: jest.fn(),
      },
    }
    const volunteer = buildVolunteer()

    mockedTwilioService.notifyVolunteer.mockResolvedValueOnce(volunteer._id)
    await notifyTutors(job)

    expect(job.queue.add).toHaveBeenCalledTimes(1)
    expect(job.data.notificationSchedule.length).toBe(1)
    expect(log).toHaveBeenCalledWith(
      `Successfully sent notification for session ${session._id} to volunteer ${volunteer._id}`
    )
  })

  test('Should notify a volunteer who has already been texted with a follow-up text once total volunteers to text has been passed', async () => {
    const { notifications, volunteers } = await fillNotifications()
    for (let i = 0; i < 3; i++) {
      const followUp = buildNotification({
        volunteer: notifications[i].volunteer,
      })
      await insertNotificationMany([followUp])
      notifications.push(followUp)
    }
    const { session } = await insertSession({ notifications })

    const expectedVolunteerIndex =
      notifications.length % TOTAL_VOLUNTEERS_TO_TEXT_FOR_HELP

    // @todo: figure out how to properly type

    const job: any = {
      data: {
        sessionId: session._id,
        notificationSchedule: config.notificationSchedule,
      },
      queue: {
        add: jest.fn(),
      },
    }

    await notifyTutors(job)
    const expectedVolunteer = volunteers[expectedVolunteerIndex]

    expect(TwilioService.sendFollowupText).toHaveBeenCalledTimes(1)
    expect(log).toHaveBeenCalledWith(
      `Successfully sent follow up for session ${session._id} to volunteer ${expectedVolunteer._id}`
    )
  })

  test('Should notify a volunteer who has already been texted with a follow-up text once after 6 min even with <15 volunteers notified', async () => {
    const totalVolunteersNotified = 6
    const { notifications, volunteers } = await fillNotifications(
      totalVolunteersNotified
    )
    for (let i = 0; i < 3; i++) {
      const followUp = buildNotification({
        volunteer: notifications[i].volunteer,
      })
      await insertNotificationMany([followUp])
      notifications.push(followUp)
    }
    const { session } = await insertSession({
      notifications,
      createdAt: moment()
        .subtract(6, 'minutes')
        .toDate(),
    })

    const expectedVolunteerIndex =
      notifications.length % totalVolunteersNotified

    // @todo: figure out how to properly type

    const job: any = {
      data: {
        sessionId: session._id,
        notificationSchedule: config.notificationSchedule,
      },
      queue: {
        add: jest.fn(),
      },
    }

    await notifyTutors(job)
    const expectedVolunteer = volunteers[expectedVolunteerIndex]

    expect(TwilioService.sendFollowupText).toHaveBeenCalledTimes(1)
    expect(log).toHaveBeenCalledWith(
      `Successfully sent follow up for session ${session._id} to volunteer ${expectedVolunteer._id}`
    )
  })
})

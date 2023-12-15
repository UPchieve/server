test.todo('postgres migration')
/*import { mocked } from 'jest-mock';
import mongoose from 'mongoose'
import {
  resetDb,
  insertSession,
  insertNotificationMany,
  insertVolunteerMany,
} from '../../db-utils'
import emailGentleWarning from '../../../worker/jobs/volunteer-emails/emailGentleWarning'
import { log as logger } from '../../../worker/logger'
import { Jobs } from '../../../worker/jobs'
import * as MailService from '../../../services/MailService'
import { buildNotification, buildVolunteer } from '../../generate'
import { Notification } from '../../../models/Notification'
import { EMAIL_RECIPIENT } from '../../../utils/aggregation-snippets'

jest.mock('../../../services/MailService')

const mockedMailService = mocked(MailService, true)

// TODO: refactor test to mock out DB calls

const createNotifications = (
  amount: number,
  volunteerId: mongoose.Types.ObjectId
): Notification[] => {
  const notifications = []
  for (let i = 0; i < amount; i++) {
    notifications.push(buildNotification({ volunteer: volunteerId }))
  }

  return notifications
}

// db connection
beforeAll(async () => {
  await mongoose.connect(global.__MONGO_URI__)
})

afterAll(async () => {
  await mongoose.connection.close()
})

beforeEach(async () => {
  await resetDb()
})

describe('Volunteer gentle warning email', () => {
  beforeEach(async () => {
    jest.resetAllMocks()
  })

  test('Should send gentle warning email to eligible volunteer who has not picked up a tutoring session and has received 5 text notifications', async () => {
    const plato = buildVolunteer({ isDeactivated: true })
    const aristotle = buildVolunteer(EMAIL_RECIPIENT)
    const kant = buildVolunteer(EMAIL_RECIPIENT)
    const sartre = buildVolunteer({
      pastSessions: [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ],
      EMAIL_RECIPIENT,
    })
    const platoNotifications = createNotifications(5, plato._id)
    const aristotleNotifications = createNotifications(5, aristotle._id)
    const kantNotification = buildNotification({ volunteer: kant._id })
    await insertNotificationMany([
      ...platoNotifications,
      ...aristotleNotifications,
      kantNotification,
    ])
    const { session } = await insertSession({
      notifications: [
        platoNotifications[1]._id,
        aristotleNotifications[1]._id,
        kantNotification,
      ],
    })
    await insertVolunteerMany([plato, aristotle, kant, sartre])
    // @todo: figure out how to properly type

    const job: any = {
      name: Jobs.EmailVolunteerGentleWarning,
      data: {
        sessionId: session._id,
      },
    }

    await emailGentleWarning(job)
    expect(MailService.sendVolunteerGentleWarning).toHaveBeenCalledTimes(1)
    expect(logger).not.toHaveBeenCalledWith(
      `Sent ${job.name} to volunteer ${plato._id}`
    )
    expect(logger).toHaveBeenCalledWith(
      `Sent ${job.name} to volunteer ${aristotle._id}`
    )
    expect(logger).not.toHaveBeenCalledWith(
      `Sent ${job.name} to volunteer ${kant._id}`
    )
    expect(logger).not.toHaveBeenCalledWith(
      `Sent ${job.name} to volunteer ${sartre._id}`
    )
  })

  test('Should throw error when sending email fails', async () => {
    const plato = buildVolunteer(EMAIL_RECIPIENT)
    const kant = buildVolunteer(EMAIL_RECIPIENT)
    const sartre = buildVolunteer({
      pastSessions: [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ],
      EMAIL_RECIPIENT,
    })
    const platoNotifications = createNotifications(5, plato._id)
    const kantNotification = buildNotification({ volunteer: kant._id })
    const errorMessage = 'Unable to send'
    const platoError = `volunteer ${plato._id}: ${errorMessage}`
    mockedMailService.sendVolunteerGentleWarning.mockRejectedValueOnce(
      errorMessage
    )

    await insertNotificationMany([...platoNotifications, kantNotification])
    const { session } = await insertSession({
      notifications: [platoNotifications[1]._id, kantNotification],
    })
    await insertVolunteerMany([plato, kant, sartre])
    // @todo: figure out how to properly type

    const job: any = {
      name: Jobs.EmailVolunteerGentleWarning,
      data: {
        sessionId: session._id,
      },
    }

    await expect(emailGentleWarning(job)).rejects.toEqual(
      Error(`Failed to send ${job.name} to: ${[platoError]}`)
    )
  })
})
*/

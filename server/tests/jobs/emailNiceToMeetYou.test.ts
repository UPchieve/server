test.todo('postgres migration')
/*import { mocked } from 'jest-mock';
import mongoose from 'mongoose'
import emailNiceToMeetYou from '../../worker/jobs/emailNiceToMeetYou'
import { Jobs } from '../../worker/jobs'
import { insertVolunteer, resetDb } from '../db-utils'
import { buildVolunteer } from '../generate'
import * as MailService from '../../services/MailService'
import { log } from '../../worker/logger'
jest.mock('../../services/MailService')
jest.mock('../../worker/logger')

jest.setTimeout(1000 * 15)

// TODO: refactor test to mock out DB calls

const mockedMailService = mocked(MailService, true)

const oneHour = 1000 * 60 * 60 * 1
const oneDay = oneHour * 24 * 1

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

describe('Email nice to meet you to volunteers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should only send emails to volunteers created a day ago', async () => {
    const volunteerOne = buildVolunteer()
    const volunteerTwo = buildVolunteer({
      createdAt: new Date(Date.now() - oneDay),
    })
    const volunteerThree = buildVolunteer({
      createdAt: new Date(Date.now() - oneDay * 3),
    })
    await Promise.all([
      insertVolunteer(volunteerOne),
      insertVolunteer(volunteerTwo),
      insertVolunteer(volunteerThree),
    ])
    await emailNiceToMeetYou()

    const expectedEmailsSent = 1
    expect(log).toHaveBeenCalledWith(
      `Sent ${Jobs.EmailNiceToMeetYou} to ${expectedEmailsSent} volunteers`
    )

    expect((MailService.sendNiceToMeetYou as jest.Mock).mock.calls.length).toBe(
      expectedEmailsSent
    )
  })

  test('Should throw error when sending email fails', async () => {
    const volunteer = buildVolunteer({
      createdAt: new Date(Date.now() - oneDay),
    })
    await insertVolunteer(volunteer)

    const errorMessage = 'Unable to send'
    const volunteerError = `volunteer ${volunteer._id}: ${errorMessage}`
    mockedMailService.sendNiceToMeetYou.mockRejectedValueOnce(errorMessage)

    await expect(emailNiceToMeetYou()).rejects.toEqual(
      new Error(
        `Failed to send ${Jobs.EmailNiceToMeetYou} to: ${volunteerError}`
      )
    )

    const expectedEmailsSent = 0
    expect(log).toHaveBeenCalledWith(
      `Sent ${Jobs.EmailNiceToMeetYou} to ${expectedEmailsSent} volunteers`
    )
    expect(log).toHaveBeenCalledTimes(1)
  })
})
*/

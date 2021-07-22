import mongoose from 'mongoose'
import moment from 'moment-timezone'
import MockDate from 'mockdate'
import { resetDb, insertVolunteer, getVolunteer } from '../../db-utils'
import emailVolunteerInactive from '../../../worker/jobs/volunteer-emails/emailVolunteerInactive'
import logger from '../../../logger'
import { Jobs } from '../../../worker/jobs'
import MailService from '../../../services/MailService'
import { buildAvailability, buildVolunteer } from '../../generate'
import { noHoursSelected } from '../../mocks/volunteer-availability'
import VolunteerModel from '../../../models/Volunteer'
import * as VolunteerService from '../../../services/VolunteerService'
jest.mock('../../../logger')
jest.mock('../../../services/MailService')

jest.setTimeout(1000 * 15)

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

afterEach(() => {
  MockDate.reset()
})

describe('Volunteer inactive emails', () => {
  const todaysDate = new Date('2021-05-01T03:00:00.000Z')
  beforeEach(async () => {
    jest.resetAllMocks()
    MockDate.set(todaysDate.getTime())
  })
  const fifteenDaysAgo = moment(todaysDate)
    .utc()
    .subtract(15, 'days')
    .toDate()
  const thirtyDaysAgo = moment(todaysDate)
    .utc()
    .subtract(30, 'days')
    .toDate()
  const fourtyDaysAgo = moment(todaysDate)
    .utc()
    .subtract(40, 'days')
    .toDate()
  const sixtyDaysAgo = moment(todaysDate)
    .utc()
    .subtract(60, 'days')
    .toDate()
  const ninetyDaysAgo = moment(todaysDate)
    .utc()
    .subtract(90, 'days')
    .toDate()

  test('Should send to volunteers who fall on inactive period of 30, 60, or 90 days ago before blackout period', async () => {
    const hemingway = buildVolunteer({
      lastActivityAt: fifteenDaysAgo
    })
    const angelou = buildVolunteer({ lastActivityAt: thirtyDaysAgo })
    const woolf = buildVolunteer({ lastActivityAt: fourtyDaysAgo })
    const dickens = buildVolunteer({ lastActivityAt: sixtyDaysAgo })
    const twain = buildVolunteer({ lastActivityAt: ninetyDaysAgo })
    const faulkner = buildVolunteer({ lastActivityAt: ninetyDaysAgo })
    const volunteers = [hemingway, angelou, woolf, dickens, twain, faulkner]
    await VolunteerModel.insertMany(volunteers)

    await emailVolunteerInactive()
    expect(MailService.sendVolunteerInactiveThirtyDays).toHaveBeenCalledTimes(1)
    expect(MailService.sendVolunteerInactiveSixtyDays).toHaveBeenCalledTimes(1)
    expect(MailService.sendVolunteerInactiveNinetyDays).toHaveBeenCalledTimes(2)
    expect(logger.info).toHaveBeenCalledWith(
      `Sent ${Jobs.EmailVolunteerInactiveThirtyDays} to volunteer ${angelou._id}`
    )
    expect(logger.info).toHaveBeenCalledWith(
      `Sent ${Jobs.EmailVolunteerInactiveSixtyDays} to volunteer ${dickens._id}`
    )
    expect(logger.info).toHaveBeenCalledWith(
      `Sent ${Jobs.EmailVolunteerInactiveNinetyDays} to volunteer ${twain._id}`
    )
    expect(logger.info).toHaveBeenCalledWith(
      `Sent ${Jobs.EmailVolunteerInactiveNinetyDays} to volunteer ${faulkner._id}`
    )
  })

  test('Should send to inactive volunteers after the blackout period', async () => {
    const todaysDate = new Date('2021-09-02T10:00:00.000Z')
    MockDate.set(todaysDate.getTime())
    const ninetyDaysAgo = moment(todaysDate)
      .utc()
      .subtract(90, 'days')
      .toDate()
    const kafka = buildVolunteer({
      lastActivityAt: ninetyDaysAgo
    })
    await insertVolunteer(kafka)

    await emailVolunteerInactive()
    expect(MailService.sendVolunteerInactiveNinetyDays).toHaveBeenCalledTimes(1)
    expect(logger.info).toHaveBeenCalledWith(
      `Sent ${Jobs.EmailVolunteerInactiveNinetyDays} to volunteer ${kafka._id}`
    )
  })

  test('Should not send to volunteers who have already received an inactive email', async () => {
    const angelou = buildVolunteer({
      lastActivityAt: thirtyDaysAgo,
      sentInactiveThirtyDayEmail: true
    })
    const dickens = buildVolunteer({
      lastActivityAt: sixtyDaysAgo,
      sentInactiveSixtyDayEmail: true
    })
    const twain = buildVolunteer({
      lastActivityAt: ninetyDaysAgo,
      sentInactiveNinetyDayEmail: true
    })
    const faulkner = buildVolunteer({ lastActivityAt: ninetyDaysAgo })
    const volunteers = [angelou, dickens, twain, faulkner]
    // @todo: figure out why getVolunteersMany does not work
    await VolunteerModel.insertMany(volunteers)
    await emailVolunteerInactive()

    expect(MailService.sendVolunteerInactiveThirtyDays).toHaveBeenCalledTimes(0)
    expect(MailService.sendVolunteerInactiveSixtyDays).toHaveBeenCalledTimes(0)
    expect(MailService.sendVolunteerInactiveNinetyDays).toHaveBeenCalledTimes(1)
    expect(logger.info).toHaveBeenCalledWith(
      `Sent ${Jobs.EmailVolunteerInactiveNinetyDays} to volunteer ${faulkner._id}`
    )
  })

  test('Should clear the availability of a volunteer who has been inactive for 90 days', async () => {
    const availability = buildAvailability({
      Wednesday: { '1p': true, '2p': true }
    })
    const twain = buildVolunteer({
      lastActivityAt: ninetyDaysAgo,
      availability
    })
    await insertVolunteer(twain)
    await emailVolunteerInactive()
    const updatedTwain = await getVolunteer(
      { _id: twain._id },
      { availability: 1 }
    )
    expect(MailService.sendVolunteerInactiveNinetyDays).toHaveBeenCalledTimes(1)
    expect(updatedTwain.availability).toMatchObject(noHoursSelected)
  })

  test('Should throw error when sending email to inactive volunteers fails', async () => {
    const angelou = buildVolunteer({ lastActivityAt: thirtyDaysAgo })
    const hemingway = buildVolunteer({ lastActivityAt: sixtyDaysAgo })
    await Promise.all([insertVolunteer(angelou), insertVolunteer(hemingway)])

    const errorMessage = 'Unable to send'
    const inactiveSixtyDayError = `${Jobs.EmailVolunteerInactiveSixtyDays} to volunteer ${hemingway._id}: ${errorMessage}`
    const rejectionFn = jest.fn(() => Promise.reject(errorMessage))
    MailService.sendVolunteerInactiveSixtyDays = rejectionFn

    await expect(emailVolunteerInactive()).rejects.toEqual(
      Error(`Failed to send inactivity emails: ${[inactiveSixtyDayError]}`)
    )
    expect(MailService.sendVolunteerInactiveThirtyDays).toHaveBeenCalledTimes(1)
    expect(MailService.sendVolunteerInactiveSixtyDays).toHaveBeenCalledTimes(1)
    expect(MailService.sendVolunteerInactiveNinetyDays).not.toHaveBeenCalled()
    expect(logger.info).toHaveBeenCalledWith(
      `Sent ${Jobs.EmailVolunteerInactiveThirtyDays} to volunteer ${angelou._id}`
    )
  })

  describe('Should not send emails to inactive volunteers if the job is run in the blackout period', () => {
    let getVolunteersWithPipelineSpy
    beforeEach(() => {
      getVolunteersWithPipelineSpy = jest.spyOn(
        VolunteerService,
        'getVolunteersWithPipeline'
      )
    })
    afterEach(() => {
      getVolunteersWithPipelineSpy.mockRestore()
    })

    function blackoutPeriodAssertion() {
      expect(getVolunteersWithPipelineSpy).toHaveBeenCalledTimes(0)
      expect(MailService.sendVolunteerInactiveThirtyDays).toHaveBeenCalledTimes(
        0
      )
      expect(MailService.sendVolunteerInactiveSixtyDays).toHaveBeenCalledTimes(
        0
      )
      expect(MailService.sendVolunteerInactiveNinetyDays).toHaveBeenCalledTimes(
        0
      )
    }

    test('Job runs on start of blackout period', async () => {
      MockDate.set(new Date('2022-06-01T00:00:00.000Z').getTime())
      await emailVolunteerInactive()
      blackoutPeriodAssertion()
    })

    test('Job runs in middle of blackout period', async () => {
      MockDate.set(new Date('2021-08-01T08:00:00.000Z').getTime())
      await emailVolunteerInactive()
      blackoutPeriodAssertion()
    })

    test('Job runs on end of blackout period', async () => {
      MockDate.set(new Date('2021-09-01T23:59:59.999Z').getTime())
      await emailVolunteerInactive()
      blackoutPeriodAssertion()
    })
  })
})

test.todo('postgres migration')
/*import { mocked } from 'jest-mock';
import mongoose from 'mongoose'
import moment from 'moment'
import 'moment-timezone'
import MockDate from 'mockdate'
import { BLACKOUT_PERIOD_START, BLACKOUT_PERIOD_END } from '../../../constants'
import { resetDb, insertVolunteer, getVolunteer } from '../../db-utils'
import emailVolunteerInactive from '../../../worker/jobs/volunteer-emails/emailVolunteerInactive'
import { log as logger } from '../../../worker/logger'
import { Jobs } from '../../../worker/jobs'
import * as MailService from '../../../services/MailService'
import { buildAvailability, buildVolunteer } from '../../generate'
import { noHoursSelected } from '../../mocks/volunteer-availability'
import VolunteerModel from '../../../models/Volunteer'
import * as VolunteerRepo from '../../../models/Volunteer/queries'

jest.mock('../../../services/MailService')

jest.setTimeout(1000 * 15)

// TODO: refactor test to mock out DB calls

const mockedMailService = mocked(MailService, true)

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
      lastActivityAt: fifteenDaysAgo,
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
    expect(logger).toHaveBeenCalledWith(
      `Sent ${Jobs.EmailVolunteerInactiveThirtyDays} to volunteer ${angelou._id}`
    )
    expect(logger).toHaveBeenCalledWith(
      `Sent ${Jobs.EmailVolunteerInactiveSixtyDays} to volunteer ${dickens._id}`
    )
    expect(logger).toHaveBeenCalledWith(
      `Sent ${Jobs.EmailVolunteerInactiveNinetyDays} to volunteer ${twain._id}`
    )
    expect(logger).toHaveBeenCalledWith(
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
      lastActivityAt: ninetyDaysAgo,
    })
    await insertVolunteer(kafka)

    await emailVolunteerInactive()
    expect(MailService.sendVolunteerInactiveNinetyDays).toHaveBeenCalledTimes(1)
    expect(logger).toHaveBeenCalledWith(
      `Sent ${Jobs.EmailVolunteerInactiveNinetyDays} to volunteer ${kafka._id}`
    )
  })

  test('Should not send to volunteers who have already received an inactive email', async () => {
    const angelou = buildVolunteer({
      lastActivityAt: thirtyDaysAgo,
      sentInactiveThirtyDayEmail: true,
    })
    const dickens = buildVolunteer({
      lastActivityAt: sixtyDaysAgo,
      sentInactiveSixtyDayEmail: true,
    })
    const twain = buildVolunteer({
      lastActivityAt: ninetyDaysAgo,
      sentInactiveNinetyDayEmail: true,
    })
    const faulkner = buildVolunteer({ lastActivityAt: ninetyDaysAgo })
    const volunteers = [angelou, dickens, twain, faulkner]
    // @todo: figure out why getVolunteersMany does not work
    await VolunteerModel.insertMany(volunteers)
    await emailVolunteerInactive()

    expect(MailService.sendVolunteerInactiveThirtyDays).toHaveBeenCalledTimes(0)
    expect(MailService.sendVolunteerInactiveSixtyDays).toHaveBeenCalledTimes(0)
    expect(MailService.sendVolunteerInactiveNinetyDays).toHaveBeenCalledTimes(1)
    expect(logger).toHaveBeenCalledWith(
      `Sent ${Jobs.EmailVolunteerInactiveNinetyDays} to volunteer ${faulkner._id}`
    )
  })

  test('Should clear the availability of a volunteer who has been inactive for 90 days', async () => {
    const availability = buildAvailability({
      Wednesday: { '1p': true, '2p': true },
    })
    const twain = buildVolunteer({
      lastActivityAt: ninetyDaysAgo,
      availability,
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
    mockedMailService.sendVolunteerInactiveSixtyDays.mockRejectedValueOnce(
      errorMessage
    )

    await expect(emailVolunteerInactive()).rejects.toEqual(
      Error(`Failed to send inactivity emails: ${[inactiveSixtyDayError]}`)
    )
    expect(MailService.sendVolunteerInactiveThirtyDays).toHaveBeenCalledTimes(1)
    expect(MailService.sendVolunteerInactiveSixtyDays).toHaveBeenCalledTimes(1)
    expect(MailService.sendVolunteerInactiveNinetyDays).not.toHaveBeenCalled()
    expect(logger).toHaveBeenCalledWith(
      `Sent ${Jobs.EmailVolunteerInactiveThirtyDays} to volunteer ${angelou._id}`
    )
  })

  describe('Should not send emails to inactive volunteers if the job is run in the blackout period', () => {
    // TODO: proper typing of SpyInstance
    let getVolunteersWithPipelineSpy: any
    beforeEach(() => {
      getVolunteersWithPipelineSpy = jest.spyOn(
        VolunteerRepo,
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
      MockDate.set(BLACKOUT_PERIOD_START.getTime())
      await emailVolunteerInactive()
      blackoutPeriodAssertion()
    })

    test('Job runs in middle of blackout period', async () => {
      MockDate.set(
        moment()
          .utc()
          .month('July')
          .endOf('month')
          .toDate()
          .getTime()
      )
      await emailVolunteerInactive()
      blackoutPeriodAssertion()
    })

    test('Job runs on end of blackout period', async () => {
      MockDate.set(BLACKOUT_PERIOD_END.getTime())
      await emailVolunteerInactive()
      blackoutPeriodAssertion()
    })
  })
})
*/

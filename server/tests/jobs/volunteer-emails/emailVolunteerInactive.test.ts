import mongoose from 'mongoose'
import moment from 'moment-timezone'
import { resetDb, insertVolunteer, getVolunteer } from '../../db-utils'
import emailVolunteerInactive from '../../../worker/jobs/volunteer-emails/emailVolunteerInactive'
import logger from '../../../logger'
import { Jobs } from '../../../worker/jobs'
import MailService from '../../../services/MailService'
import { buildAvailability, buildVolunteer } from '../../generate'
import { noHoursSelected } from '../../mocks/volunteer-availability'
import VolunteerModel from '../../../models/Volunteer'
jest.mock('../../../logger')
jest.mock('../../../services/MailService')

jest.setTimeout(1000 * 15)

const fifteenDaysAgo = moment()
  .utc()
  .subtract(15, 'days')
const thirtyDaysAgo = moment()
  .utc()
  .subtract(30, 'days')
const fourtyDaysAgo = moment()
  .utc()
  .subtract(40, 'days')
const sixtyDaysAgo = moment()
  .utc()
  .subtract(60, 'days')
const ninetyDaysAgo = moment()
  .utc()
  .subtract(90, 'days')

// db connection
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})

beforeEach(async () => {
  await resetDb()
})

describe('Volunteer inactive emails', () => {
  beforeEach(async () => {
    jest.resetAllMocks()
  })

  test('Should send to volunteers who fall on inactive period of 30, 60, or 90 days ago', async () => {
    const hemingway = buildVolunteer({
      lastActivityAt: new Date(fifteenDaysAgo)
    })
    const angelou = buildVolunteer({ lastActivityAt: new Date(thirtyDaysAgo) })
    const woolf = buildVolunteer({ lastActivityAt: new Date(fourtyDaysAgo) })
    const dickens = buildVolunteer({ lastActivityAt: new Date(sixtyDaysAgo) })
    const twain = buildVolunteer({ lastActivityAt: new Date(ninetyDaysAgo) })
    const faulkner = buildVolunteer({ lastActivityAt: new Date(ninetyDaysAgo) })
    const volunteers = [hemingway, angelou, woolf, dickens, twain, faulkner]
    // @todo: figure out why getVolunteersMany does not work
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

  test('Should clear the availability of a volunteer who has been inactive for 90 days', async () => {
    const availability = buildAvailability({
      Wednesday: { '1p': true, '2p': true }
    })
    const twain = buildVolunteer({
      lastActivityAt: new Date(ninetyDaysAgo),
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

  test('Should catch error when sending email to inactive volunteers', async () => {
    const angelou = buildVolunteer({ lastActivityAt: new Date(thirtyDaysAgo) })
    const hemingway = buildVolunteer({ lastActivityAt: new Date(sixtyDaysAgo) })
    await Promise.all([insertVolunteer(angelou), insertVolunteer(hemingway)])

    const errorMessage = 'Unable to send'
    const rejectionFn = jest.fn(() => Promise.reject(errorMessage))
    MailService.sendVolunteerInactiveSixtyDays = rejectionFn

    await emailVolunteerInactive()
    expect(MailService.sendVolunteerInactiveThirtyDays).toHaveBeenCalledTimes(1)
    expect(MailService.sendVolunteerInactiveSixtyDays).toHaveBeenCalledTimes(1)
    expect(MailService.sendVolunteerInactiveNinetyDays).not.toHaveBeenCalled()
    expect(logger.info).toHaveBeenCalledWith(
      `Sent ${Jobs.EmailVolunteerInactiveThirtyDays} to volunteer ${angelou._id}`
    )
    expect(logger.error).toHaveBeenCalledWith(
      `Failed to send ${Jobs.EmailVolunteerInactiveSixtyDays} to volunteer ${hemingway._id}: ${errorMessage}`
    )
  })
})

test.todo('postgres migration')
/*import mongoose from 'mongoose'
import { mocked } from 'jest-mock';
import emailWeeklyHourSummary from '../../worker/jobs/emailWeeklyHourSummary'
import { getVolunteer, insertVolunteer, resetDb } from '../db-utils'
import { buildVolunteer } from '../generate'
import * as MailService from '../../services/MailService'
import { log } from '../../worker/logger'
import * as VolunteerService from '../../services/VolunteerService'
import { Jobs } from '../../worker/jobs'
import * as reportUtils from '../../utils/reportUtils'
import config from '../../config'

// TODO: refactor test to mock out DB calls

jest.mock('../../services/MailService')
jest.mock('../../worker/logger')

jest.mock('../../utils/reportUtils', () => ({
  ...jest.requireActual('../../utils/reportUtils'),
  telecomHourSummaryStats: jest.fn(),
}))
const mockedReportUtils = mocked(reportUtils, true)

jest.setTimeout(15000)

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

describe('emailWeeklyHourSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should only send emails to volunteers with totalVolunteerHours greater than 0.01', async () => {
    const marvin = buildVolunteer()
    const otis = buildVolunteer()
    const whitney = buildVolunteer()

    await Promise.all([
      insertVolunteer(marvin),
      insertVolunteer(otis),
      insertVolunteer(whitney),
    ])

    const getHourSummaryStats = jest.spyOn(
      VolunteerService,
      'getHourSummaryStats'
    )
    getHourSummaryStats
      .mockImplementationOnce(async () => ({
        totalCoachingHours: 2,
        totalQuizzesPassed: 1,
        totalElapsedAvailability: 0,
        totalVolunteerHours: 3,
      }))
      .mockImplementationOnce(async () => ({
        totalCoachingHours: 0.01,
        totalQuizzesPassed: 0,
        totalElapsedAvailability: 0,
        totalVolunteerHours: 0.01,
      }))
      .mockImplementationOnce(async () => ({
        totalCoachingHours: 5,
        totalQuizzesPassed: 0,
        totalElapsedAvailability: 3,
        totalVolunteerHours: 5.3,
      }))

    await emailWeeklyHourSummary()

    const expectedEmailsSent = 2
    expect(log).toHaveBeenCalledWith(
      `Successfully ${Jobs.EmailWeeklyHourSummary} for ${expectedEmailsSent} volunteers`
    )
    expect(
      (MailService.sendHourSummaryEmail as jest.Mock).mock.calls.length
    ).toBe(2)
  })

  test('Should set sentHourSummaryIntroEmail to true for volunteers that have not been sent sendHourSummaryEmail email before', async () => {
    const jackson = buildVolunteer({ sentHourSummaryIntroEmail: true })
    const warwick = buildVolunteer()
    const prince = buildVolunteer({ sentHourSummaryIntroEmail: true })

    await Promise.all([
      insertVolunteer(jackson),
      insertVolunteer(warwick),
      insertVolunteer(prince),
    ])

    const getHourSummaryStats = jest.spyOn(
      VolunteerService,
      'getHourSummaryStats'
    )
    getHourSummaryStats
      .mockImplementationOnce(async () => ({
        totalCoachingHours: 1,
        totalQuizzesPassed: 1,
        totalElapsedAvailability: 1,
        totalVolunteerHours: 2.1,
      }))
      .mockImplementationOnce(async () => ({
        totalCoachingHours: 2,
        totalQuizzesPassed: 1,
        totalElapsedAvailability: 0,
        totalVolunteerHours: 3,
      }))
      .mockImplementationOnce(async () => ({
        totalCoachingHours: 5,
        totalQuizzesPassed: 0,
        totalElapsedAvailability: 3,
        totalVolunteerHours: 5.3,
      }))

    await emailWeeklyHourSummary()
    const updatedWarwick = await getVolunteer(
      { _id: warwick._id },
      { sentHourSummaryIntroEmail: 1 }
    )

    expect(updatedWarwick.sentHourSummaryIntroEmail).toBeTruthy()
  })

  test('Should throw error when sending emails fails', async () => {
    const jackson = buildVolunteer({ sentHourSummaryIntroEmail: true })
    await insertVolunteer(jackson)

    const getHourSummaryStats = jest.spyOn(
      VolunteerService,
      'getHourSummaryStats'
    )
    const statsError = new Error('Server error')
    const jacksonError = `${jackson._id}: ${statsError}\n`
    getHourSummaryStats.mockImplementationOnce(() => Promise.reject(statsError))

    await expect(emailWeeklyHourSummary()).rejects.toEqual(
      Error(
        `Failed to ${Jobs.EmailWeeklyHourSummary} for volunteers:\n${[
          jacksonError,
        ]}`
      )
    )

    const expectedEmailsSent = 0
    expect(log).toHaveBeenCalledWith(
      `Successfully ${Jobs.EmailWeeklyHourSummary} for ${expectedEmailsSent} volunteers`
    )
  })

  test('Should log error in generating custom analytics', async () => {
    const pablo = buildVolunteer({
      volunteerPartnerOrg: config.customVolunteerPartnerOrgs[0],
      isOnboarded: true,
      isApproved: true,
    })
    await insertVolunteer(pablo)

    const statsError = new Error('Stats error')
    const pabloError = `${pablo._id}: ${statsError}\n` // error will be key error on analytics
    mockedReportUtils.telecomHourSummaryStats.mockImplementationOnce(() =>
      Promise.reject(statsError)
    )

    await expect(emailWeeklyHourSummary()).rejects.toEqual(
      Error(
        `Failed to ${Jobs.EmailWeeklyHourSummary} for volunteers:\n${[
          pabloError,
        ]}`
      )
    )

    const expectedEmailsSent = 0
    expect(log).toHaveBeenCalledWith(
      `Successfully ${Jobs.EmailWeeklyHourSummary} for ${expectedEmailsSent} volunteers`
    )
  })

  test('Should send email to both regular and custom partner volunteers', async () => {
    const raul = buildVolunteer({
      volunteerPartnerOrg: config.customVolunteerPartnerOrgs[0],
      isOnboarded: true,
      isApproved: true,
      sentHourSummaryIntroEmail: true,
    })
    const jackson = buildVolunteer({
      sentHourSummaryIntroEmail: true,
    })
    await insertVolunteer(raul)
    await insertVolunteer(jackson)

    const stats = {
      totalVolunteerHours: 6,
      totalCoachingHours: 3,
      totalElapsedAvailability: 2,
      totalQuizzesPassed: 1,
    }
    mockedReportUtils.telecomHourSummaryStats.mockImplementationOnce(
      async () => stats
    )
    const getHourSummaryStats = jest.spyOn(
      VolunteerService,
      'getHourSummaryStats'
    )
    getHourSummaryStats.mockImplementationOnce(async () => ({
      totalCoachingHours: 1,
      totalQuizzesPassed: 1,
      totalElapsedAvailability: 1,
      totalVolunteerHours: 2.1,
    }))

    await emailWeeklyHourSummary()

    const expectedEmailsSent = 2
    expect(log).toHaveBeenCalledWith(
      `Successfully ${Jobs.EmailWeeklyHourSummary} for ${expectedEmailsSent} volunteers`
    )
    expect(
      (MailService.sendHourSummaryEmail as jest.Mock).mock.calls.length
    ).toBe(expectedEmailsSent)
  })
})
*/

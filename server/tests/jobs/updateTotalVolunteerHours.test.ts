test.todo('postgres migration')
/*import mongoose from 'mongoose'
import moment from 'moment'
import { mocked } from 'jest-mock';
import UpdateTotalVolunteerHours from '../../worker/jobs/updateTotalVolunteerHours'
import { resetDb, getVolunteer, insertVolunteer } from '../db-utils'
import { log } from '../../worker/logger'
import { Jobs } from '../../worker/jobs'
import * as reportUtils from '../../utils/reportUtils'
import * as cache from '../../cache'
import config from '../../config'
import { HourSummaryStats } from '../../services/VolunteerService'

jest.mock('../../worker/logger')

jest.mock('../../utils/reportUtils', () => ({
  ...jest.requireActual('../../utils/reportUtils'),
  telecomHourSummaryStats: jest.fn(),
}))
const mockedReportUtils = mocked(reportUtils, true)

// db connection
beforeAll(async () => {
  await mongoose.connect(global.__MONGO_URI__)
})

afterAll(async () => {
  await mongoose.connection.close()
})

describe('Test updating total volunteer hours', () => {
  beforeEach(async () => {
    await resetDb()
    jest.clearAllMocks()
    await cache.save(
      config.cacheKeys.updateTotalVolunteerHoursLastRun,
      moment()
        .subtract(1, 'week')
        .format()
    )
  })

  // test objects
  const customOverrides = {
    volunteerPartnerOrg: config.customVolunteerPartnerOrgs[0],
    totalVolunteerHours: 4,
    isTestUser: false,
    isFakeUser: false,
    isOnboarded: true,
    isApproved: true,
  }

  test('Should not update non-custom partner volunteers', async () => {
    const preVolunteer = await insertVolunteer() // insert nonpartner volunteer

    let err
    try {
      await UpdateTotalVolunteerHours()
    } catch (error) {
      err = error
    }

    expect(err).toBeUndefined()

    const expected = 0
    expect(log).toHaveBeenCalledTimes(1)
    expect(log).toHaveBeenCalledWith(
      `Successfully ${Jobs.UpdateTotalVolunteerHours} for ${expected} volunteers`
    )

    const postVolunteer = await getVolunteer(
      { _id: preVolunteer._id },
      { totalVolunteerHours: 1 }
    )
    expect(postVolunteer.totalVolunteerHours).toBe(0)
  })

  test('Should update custom partner volunteers', async () => {
    const preVolunteer = await insertVolunteer(customOverrides)
    const row = {
      totalVolunteerHours: 6,
      totalCoachingHours: 3,
      totalElapsedAvailability: 2,
      totalQuizzesPassed: 1,
    } as HourSummaryStats
    mockedReportUtils.telecomHourSummaryStats.mockImplementationOnce(
      async () => row
    )

    let err
    try {
      await UpdateTotalVolunteerHours()
    } catch (error) {
      err = error
    }

    expect(err).toBeUndefined()

    const expected = 1
    expect(log).toHaveBeenCalledTimes(1)
    expect(log).toHaveBeenCalledWith(
      `Successfully ${Jobs.UpdateTotalVolunteerHours} for ${expected} volunteers`
    )

    const postVolunteer = await getVolunteer(
      { _id: preVolunteer._id },
      { totalVolunteerHours: 1 }
    )
    expect(postVolunteer.totalVolunteerHours).toBe(10)
  })

  test('Should throw on stats generation error', async () => {
    const preVolunteer = await insertVolunteer(customOverrides)
    const statsError = new Error('test error')
    mockedReportUtils.telecomHourSummaryStats.mockImplementationOnce(() =>
      Promise.reject(statsError)
    )
    const volunteerError = `${preVolunteer._id}: ${statsError}\n`

    try {
      await UpdateTotalVolunteerHours()
    } catch (error) {
      expect((error as Error).message).toBe(
        `Failed to ${Jobs.UpdateTotalVolunteerHours} for volunteers:\n${[
          volunteerError,
        ]}`
      )
    }

    const expected = 0
    expect(log).toHaveBeenCalledTimes(1)
    expect(log).toHaveBeenCalledWith(
      `Successfully ${Jobs.UpdateTotalVolunteerHours} for ${expected} volunteers`
    )
  })
})
*/

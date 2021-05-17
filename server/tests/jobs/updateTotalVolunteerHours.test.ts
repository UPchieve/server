import mongoose from 'mongoose'
import moment from 'moment'
import { mocked } from 'ts-jest/utils'
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
  generateTelecomAnalytics: jest.fn()
}))
const mockedReportUtils = mocked(reportUtils, true)

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

describe('Test updating total volunteer hours', () => {
  beforeEach(async () => {
    await resetDb()
    jest.clearAllMocks()
    cache.save(
      config.cacheKeys.updateTotalVolunteerHoursLastRun,
      moment()
        .subtract(1, 'week')
        .toString()
    )
  })

  // test objects
  const customOverrides = {
    volunteerPartnerOrg: 'example',
    totalVolunteerHours: 4,
    isTestUser: false,
    isFakeUser: false,
    isOnboarded: true,
    isApproved: true
  }

  test('Should not update non-custom partner volunteers', async () => {
    const preVolunteer = await insertVolunteer() // insert nonpartner volunteer
    mockedReportUtils.generateTelecomAnalytics.mockImplementationOnce(
      async () => {
        return {}
      }
    )

    let err
    try {
      await UpdateTotalVolunteerHours()
    } catch (error) {
      err = error
    }

    expect(err).toBeUndefined()

    const postVolunteer = await getVolunteer(
      { _id: preVolunteer._id },
      { totalVolunteerHours: 1 }
    )
    expect(postVolunteer.totalVolunteerHours).toBe(0)

    expect(log).toHaveBeenCalledTimes(1) // if partner volunteer was found there would be 1 error logged
    const expected = 0
    expect(log).toHaveBeenCalledWith(
      `Successfully ${Jobs.UpdateTotalVolunteerHours} for ${expected} volunteers`
    )
  })

  test('Should update custom partner volunteers', async () => {
    const preVolunteer = await insertVolunteer(customOverrides)
    const row = {
      totalVolunteerHours: 6,
      totalCoachingHours: 3,
      totalElapsedAvailability: 2,
      totalQuizzesPassed: 1
    } as HourSummaryStats
    mockedReportUtils.generateTelecomAnalytics.mockImplementationOnce(
      async () => {
        return { [preVolunteer._id.toString()]: row }
      }
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

    const postVolunteer = await getVolunteer({ _id: preVolunteer._id })
    expect(postVolunteer.totalVolunteerHours).toBe(10)
  })

  test('Should throw on analytics generation error', async () => {
    const errorMsg = 'test error'
    mockedReportUtils.generateTelecomAnalytics.mockImplementationOnce(
      async () => {
        throw new Error(errorMsg)
      }
    )

    let err
    try {
      await UpdateTotalVolunteerHours()
    } catch (error) {
      err = error
    }

    expect(log).toHaveBeenCalledTimes(0)
    expect(err.message).toBe('test error')
  })
})

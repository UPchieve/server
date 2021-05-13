import mongoose from 'mongoose'
import { mocked } from 'ts-jest/utils'
import UpdateTotalVolunteerHours from '../../worker/jobs/updateTotalVolunteerHours'
import {
  resetDb,
  getVolunteer,
  insertVolunteer
} from '../db-utils'
import { buildVolunteer } from '../generate'
import { log } from '../../worker/logger'
import { Jobs } from '../../worker/jobs'
import * as reportUtils from '../../utils/reportUtils'

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

beforeEach(async () => {
  await resetDb()
  jest.clearAllMocks()
})

describe('Test updating total volunteer hours', () => {
  // test objects
  const customOverrides = {
    volunteerPartnerOrg: 'example',
    totalVolunteerHours: 4,
    isTestUser: false,
    isFakeUser: false,
    isOnboarded: true,
    isApproved: true
  }
  const cusVolunteer = buildVolunteer(customOverrides)
  const row = {
    volunteer: cusVolunteer._id,
    totalHours: 6,
    sessionHours: 3,
    availabilityHours: 2,
    certificationHours: 1
  } as reportUtils.TelecomAnalyticsRow

  test('Should not update non-custom partner volunteers', async () => {
    mockedReportUtils.generateTelecomAnalytics.mockImplementationOnce(async () => {
      return [row]
    })

    await UpdateTotalVolunteerHours()

    expect(log).toHaveBeenCalledTimes(1)
    const expected = 0
    expect(log).toHaveBeenCalledWith(
      `Successfully ${Jobs.UpdateTotalVolunteerHours} for ${expected} volunteers`
    )
  })

  test('Should update custom partner volunteers', async () => {
    const preVolunteer = await insertVolunteer(customOverrides)
    row.volunteer = preVolunteer._id
    mockedReportUtils.generateTelecomAnalytics.mockImplementationOnce(async () => {
      return [row]
    })

    let err
    try {
      await UpdateTotalVolunteerHours()
    } catch(error) {
      err = error
    }

    expect(err).toBeUndefined()

    const postVolunteer = await getVolunteer({ _id: preVolunteer._id }, { totalVolunteerHours: 1 })
    expect(postVolunteer.totalVolunteerHours).toBe(10)

    const expected = 1
    expect(log).toHaveBeenCalledTimes(1)
    expect(log).toHaveBeenCalledWith(
      `Successfully ${Jobs.UpdateTotalVolunteerHours} for ${expected} volunteers`
    )

    row.volunteer = cusVolunteer._id
  })

  test('Should throw on analytics generation error', async () => {
    const errorMsg = 'test error'
    mockedReportUtils.generateTelecomAnalytics.mockImplementationOnce(async () => {
      throw new Error(errorMsg)
    })

    let err
    try {
      await UpdateTotalVolunteerHours()
    } catch(error) {
      err = error
    }

    expect(log).toHaveBeenCalledTimes(0)
    expect(err.message).toBe('test error')
  })
})


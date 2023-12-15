test.todo('postgres migration')
/*import mongoose from 'mongoose'
import {
  getElapsedAvailabilityForDateRange,
  getElapsedAvailability,
} from '../../services/AvailabilityService'
import { getHistoryForDatesByVolunteerId } from '../../models/Availability/queries'
import { resetDb } from '../db-utils'
import {
  buildVolunteer,
  buildAvailabilityHistory,
  buildAvailabilityDay,
} from '../generate'
import AvailabilityHistoryModel from '../../models/Availability/History'

jest.setTimeout(15000) // db queries can run slow on local dev environments

beforeAll(async () => {
  await mongoose.connect(global.__MONGO_URI__)
})

afterAll(async () => {
  await mongoose.connection.close()
})

beforeEach(async () => {
  await resetDb()
  jest.clearAllMocks()
})

// TODO: should be tested by Availabilitymodel/queries
describe('getHistoryForDatesByVolunteerId', () => {
  test('Should get recent availability history for a volunteer', async () => {
    const newton = buildVolunteer()
    const volunteerId = newton._id
    const date = new Date('10/11/2020')
    const newestDoc = buildAvailabilityHistory({
      date: new Date(),
      volunteerId,
    })
    const oldestDoc = buildAvailabilityHistory({
      date: new Date('10/10/2020'),
      volunteerId,
    })
    const oldDoc = buildAvailabilityHistory({
      date,
      volunteerId,
    })
    await AvailabilityHistoryModel.insertMany([newestDoc, oldestDoc, oldDoc])

    const result = await getHistoryForDatesByVolunteerId(
      volunteerId,
      new Date('10/9/2020'),
      new Date('10/12/2021')
    )
    expect(result[0]!.date).toEqual(date)
  })
})

describe('getElapsedAvailabilityForDateRange', () => {
  test('Should get the total elapsed availability for a volunteer over given a date range', async () => {
    const turing = buildVolunteer()
    const volunteerId = turing._id
    await AvailabilityHistoryModel.insertMany([
      buildAvailabilityHistory({
        date: new Date('12/01/2020'),
        volunteerId,
        availability: buildAvailabilityDay({ '12p': true, '1p': true }),
      }),
      buildAvailabilityHistory({
        date: new Date('12/02/2020'),
        volunteerId,
        availability: buildAvailabilityDay(),
      }),
      buildAvailabilityHistory({
        date: new Date('12/03/2020'),
        volunteerId,
        availability: buildAvailabilityDay({
          '10a': true,
          '11a': true,
          '12p': true,
          '4p': true,
        }),
      }),
      buildAvailabilityHistory({
        date: new Date('12/04/2020'),
        volunteerId,
        availability: buildAvailabilityDay({ '4p': true, '5p': true }),
      }),
      buildAvailabilityHistory({
        date: new Date('12/14/2020'),
        volunteerId,
        availability: buildAvailabilityDay({ '4p': true, '5p': true }),
      }),
    ])

    const fromDate = new Date('12/03/2020')
    const toDate = new Date('12/30/2020')
    const result = await getElapsedAvailabilityForDateRange(
      volunteerId,
      fromDate,
      toDate
    )

    const expectedElapsedAvailability = 8
    expect(result).toEqual(expectedElapsedAvailability)
  })
})

describe('getElapsedAvailability', () => {
  test('Should get elapsed availability of 0 when no hours are selected for the day', () => {
    const availabilityDay = buildAvailabilityDay()
    const result = getElapsedAvailability(availabilityDay)
    const expectedElapsedAvailability = 0
    expect(result).toBe(expectedElapsedAvailability)
  })

  test('Should get elapsed availability of 24 when all hours were selected for the day', () => {
    const overrides = {
      '12a': true,
      '1a': true,
      '2a': true,
      '3a': true,
      '4a': true,
      '5a': true,
      '6a': true,
      '7a': true,
      '8a': true,
      '9a': true,
      '10a': true,
      '11a': true,
      '12p': true,
      '1p': true,
      '2p': true,
      '3p': true,
      '4p': true,
      '5p': true,
      '6p': true,
      '7p': true,
      '8p': true,
      '9p': true,
      '10p': true,
      '11p': true,
    }
    const availabilityDay = buildAvailabilityDay(overrides)
    const result = getElapsedAvailability(availabilityDay)
    const expectedElapsedAvailability = 24
    expect(result).toBe(expectedElapsedAvailability)
  })

  test('Should get elapsed availability of 5 when only 5 hour periods are selected', () => {
    const overrides = {
      '10a': true,
      '11a': true,
      '12p': true,
      '4p': true,
      '5p': true,
    }
    const availabilityDay = buildAvailabilityDay(overrides)
    const result = getElapsedAvailability(availabilityDay)
    const expectedElapsedAvailability = 5
    expect(result).toBe(expectedElapsedAvailability)
  })
})
*/

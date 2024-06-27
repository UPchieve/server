test.todo('postgres migration')
/*import mongoose from 'mongoose'
import moment from 'moment'
import 'moment-timezone'
import updateElapsedAvailability from '../../worker/jobs/updateElapsedAvailability'
import {
  getVolunteer,
  insertAvailabilitySnapshot,
  insertVolunteer,
  resetDb,
} from '../db-utils'
import { buildAvailability, buildVolunteer } from '../generate'
import { log } from '../../worker/logger'
import { Jobs } from '../../worker/jobs'
import AvailabilityHistoryModel from '../../models/Availability/History'
jest.mock('../../services/MailService')
jest.mock('../../worker/logger')
jest.setTimeout(1000 * 15)

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

function getAvailabilityHistory(query: any, projection = {}) {
  return AvailabilityHistoryModel.findOne(query)
    .select(projection)
    .lean()
    .exec()
}

describe('updateElapsedAvailability', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should not update volunteers with no availability snapshot', async () => {
    const clapton = buildVolunteer()
    await insertVolunteer(clapton)
    await updateElapsedAvailability()

    const expectedUpdatedVolunteers = 0
    expect(log).toHaveBeenCalledWith(
      `Successfully ${Jobs.UpdateElapsedAvailability} for ${expectedUpdatedVolunteers} volunteers`
    )
  })

  test('Should update volunteer accounts that are onboarded and approved', async () => {
    const hendrix = buildVolunteer({
      isOnboarded: true,
      isApproved: true,
      elapsedAvailability: 10,
    })
    const berry = buildVolunteer()
    const day = moment()
      .utc()
      .subtract(1, 'days')
      .format('dddd')
    await Promise.all([insertVolunteer(hendrix), insertVolunteer(berry)])
    await insertAvailabilitySnapshot({
      volunteerId: hendrix._id,
      onCallAvailability: buildAvailability({
        [day]: { '1p': true, '2p': true },
      }),
    })

    await updateElapsedAvailability()
    const updatedHendrix = await getVolunteer(
      { _id: hendrix._id },
      { elapsedAvailability: 1 }
    )

    // TODO: refactor test to mock out db calls
    const newAvailabilityHistory = await getAvailabilityHistory(
      { volunteerId: hendrix._id },
      { availability: 1 }
    )

    const expectedTotalElapsedAvailability = 12
    expect(updatedHendrix.elapsedAvailability).toEqual(
      expectedTotalElapsedAvailability
    )

    const expectedAvailabilityDay = {
      '12a': false,
      '1a': false,
      '2a': false,
      '3a': false,
      '4a': false,
      '5a': false,
      '6a': false,
      '7a': false,
      '8a': false,
      '9a': false,
      '10a': false,
      '11a': false,
      '12p': false,
      '1p': true,
      '2p': true,
      '3p': false,
      '4p': false,
      '5p': false,
      '6p': false,
      '7p': false,
      '8p': false,
      '9p': false,
      '10p': false,
      '11p': false,
    }
    expect(newAvailabilityHistory!.availability).toMatchObject(
      expectedAvailabilityDay
    )

    const expectedUpdatedVolunteers = 1
    expect(log).toHaveBeenCalledWith(
      `Successfully ${Jobs.UpdateElapsedAvailability} for ${expectedUpdatedVolunteers} volunteers`
    )
  })
})
*/

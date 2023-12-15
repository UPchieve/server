test.todo('postgres migration')
/*import mongoose from 'mongoose'
import * as VolunteerRepo from '../../../models/Volunteer/queries'
import VolunteerModel, { Volunteer } from '../../../models/Volunteer'
import { RepoReadError } from '../../../models/Errors'
import { insertVolunteer, resetDb } from '../../db-utils'
import { mockMongooseFindQuery } from '../../utils'
import { SUBJECTS } from '../../../constants'
import { buildAvailability } from '../../generate'

async function resetVolunteerDb(): Promise<void> {
  await VolunteerModel.deleteMany({})
}

const mockMondayAvailability = {
  '1a': false,
  '2a': false,
  '3a': false,
  '4a': false,
  '5a': false,
  '6a': false,
  '7a': false,
  '8a': false,
  '9a': true,
  '10a': true,
  '11a': true,
  '12a': true,
  '1p': true,
  '2p': true,
  '3p': true,
  '4p': true,
  '5p': true,
  '6p': true,
  '7p': true,
  '8p': true,
  '9p': true,
  '10p': false,
  '11p': false,
  '12p': false,
}

beforeAll(async () => {
  await mongoose.connect(global.__MONGO_URI__)
})

beforeEach(() => {
  // restore spys between tests
  jest.restoreAllMocks()
})

afterAll(async () => {
  await resetDb()
  await resetVolunteerDb()
  await mongoose.connection.close()
})

describe('getVolunteersOnDeck', () => {
  let volunteer: Volunteer
  const availabilityPath = 'availability.Monday.9a'
  const requestedSubject = SUBJECTS.PREALGREBA

  beforeAll(async () => {
    await resetVolunteerDb()
    volunteer = await insertVolunteer({
      availability: buildAvailability({
        Monday: mockMondayAvailability,
      }),
      subjects: [SUBJECTS.PREALGREBA, SUBJECTS.HUMANITIES_ESSAYS],
    })
  })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('Should return a list of volunteers who are on deck', async () => {
    const result = await VolunteerRepo.getVolunteersOnDeck(
      requestedSubject,
      [],
      availabilityPath
    )

    expect(result).toHaveLength(1)
  })

  test('Should return an empty list when no volunteers are on deck', async () => {
    const result = await VolunteerRepo.getVolunteersOnDeck(
      requestedSubject,
      [volunteer._id],
      availabilityPath
    )

    expect(result).toHaveLength(0)
  })

  test('getVolunteersOnDeck bubbles up errors from database find', async () => {
    const mockedVolunteerModelFind = jest.spyOn(VolunteerModel, 'find')
    const testError = new Error('Test error')
    mockedVolunteerModelFind.mockImplementationOnce(
      // @ts-expect-error
      mockMongooseFindQuery(() => {
        throw testError
      })
    )

    let error: RepoReadError
    try {
      await VolunteerRepo.getVolunteersOnDeck(
        requestedSubject,
        [volunteer._id],
        availabilityPath
      )
    } catch (err) {
      error = err as Error
    }

    expect(error!).toBeInstanceOf(RepoReadError)
    expect((error! as RepoReadError).message).toContain(testError.message)
  })
})
*/

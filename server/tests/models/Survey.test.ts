test.todo('postgres migration')
/*import mongoose from 'mongoose'
import * as SurveyRepo from '../../models/Survey/queries'
import SurveyModel from '../../models/Survey'
import { resetDb } from '../db-utils'

async function resetSurveys(): Promise<void> {
  await SurveyModel.deleteMany({})
}

beforeAll(async () => {
  await mongoose.connect(global.__MONGO_URI__)
})

afterAll(async () => {
  await resetDb()
  await resetSurveys()
  await mongoose.connection.close()
})

beforeEach(() => {
  // reset spys between tests
  jest.restoreAllMocks()
})

describe('Test create presession survey objects', () => {
  const sessionId = new mongoose.Types.ObjectId()
  const userId = new mongoose.Types.ObjectId()
  const responseData = {
    hello: 'world',
  }

  beforeAll(async () => {
    await resetDb()
    await resetSurveys()
  })

  beforeEach(async () => {
    jest.resetAllMocks()
    await resetSurveys()
  })

  test('Create inserts brand new survey', async () => {
    const createdSurvey = await SurveyRepo.savePresessionSurvey(
      userId,
      sessionId,
      responseData
    )

    const foundSurvey = await SurveyModel.findById(createdSurvey._id)
      .lean()
      .exec()
    expect(foundSurvey!.session).toEqual(sessionId)
  })

  test('Create upserts with re-used sessions/users', async () => {
    await SurveyRepo.savePresessionSurvey(userId, sessionId, responseData)

    const altResponseData = { foo: 'bar' }
    const upsertedSurvey = await SurveyRepo.savePresessionSurvey(
      userId,
      sessionId,
      altResponseData
    )

    expect(upsertedSurvey!.session).toEqual(sessionId)
    expect(upsertedSurvey!.responseData).toEqual(altResponseData)
  })
})
*/

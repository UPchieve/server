import mongoose from 'mongoose'
import { v4 as uuid } from 'uuid'
import * as AssistmentsDataRepo from '../../models/AssistmentsData'
import SessionModel, { Session } from '../../models/Session'
import { RepoCreateError, RepoReadError } from '../../models/Errors'
import { insertSession, resetDb } from '../db-utils'
import { mockMongooseFindQuery } from '../utils'

async function resetAD(): Promise<void> {
  await AssistmentsDataRepo.AssistmentsDataModel.deleteMany({})
}

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
})

afterAll(async () => {
  await resetDb()
  await resetAD()
  await mongoose.connection.close()
})

const problemId = 12345
const assignmentId = uuid()
const studentId = uuid()

describe('Test create AssistmentData objects', () => {
  let validSession: Session

  beforeAll(async () => {
    await resetDb()
    await resetAD()
    const { session: newSession } = await insertSession(
      {},
      {
        studentPartnerOrg: AssistmentsDataRepo.ASSISTMENTS
      }
    )
    validSession = newSession
  })

  beforeEach(async () => {
    jest.resetAllMocks()
    await resetAD()
  })

  test('Create succeeds for valid session', async () => {
    const createdAD = await AssistmentsDataRepo.createBySession(
      problemId,
      assignmentId,
      studentId,
      validSession._id
    )

    const ad = await AssistmentsDataRepo.AssistmentsDataModel.findById(
      createdAD._id
    )
      .lean()
      .exec()
    expect(ad.session).toEqual(validSession._id)
  })

  test('Create errors with invalid session', async () => {
    const invalidSessionId = mongoose.Types.ObjectId() // unused Id

    let error: RepoCreateError
    try {
      await AssistmentsDataRepo.createBySession(
        problemId,
        assignmentId,
        studentId,
        invalidSessionId
      )
    } catch (err) {
      error = err
    }

    // Assert error thrown
    expect(error instanceof RepoCreateError).toBeTruthy()
    expect(error.message).toBe(`Session ${invalidSessionId} does not exist`)
  })

  test('Create errors with re-used sessions', async () => {
    await AssistmentsDataRepo.createBySession(
      problemId,
      assignmentId,
      studentId,
      validSession._id
    )

    let error: RepoCreateError
    try {
      await AssistmentsDataRepo.createBySession(
        problemId,
        assignmentId,
        studentId,
        validSession._id
      )
    } catch (err) {
      error = err
    }

    expect(error instanceof RepoCreateError).toBeTruthy()
    expect(error.message).toBe(
      `AssistmentsData document for session ${validSession._id} already exists`
    )
  })

  test('Create bubbles up errors from database find', async () => {
    const mockedSessionModelFind = jest.spyOn(SessionModel, 'findById')
    const testError = new Error('Test error')
    mockedSessionModelFind.mockImplementationOnce(
      // @ts-expect-error
      mockMongooseFindQuery(() => {
        throw testError
      })
    )

    let error: RepoReadError
    try {
      await AssistmentsDataRepo.createBySession(
        problemId,
        assignmentId,
        studentId,
        validSession._id
      )
    } catch (err) {
      error = err
    }

    expect(error instanceof RepoReadError)
    expect(error.message).toBe(testError.message)
  })
})

describe('Test read AssistmentData objects', () => {
  let validSession: Session
  let createdAD: AssistmentsDataRepo.AssistmentsData

  beforeAll(async () => {
    await resetDb()
    await resetAD()
    const { session: newSession } = await insertSession(
      {},
      {
        studentPartnerOrg: AssistmentsDataRepo.ASSISTMENTS
      }
    )
    validSession = newSession
    const newAD = await AssistmentsDataRepo.AssistmentsDataModel.create({
      problemId,
      assignmentId,
      studentId,
      session: validSession._id
    })
    createdAD = newAD.toObject() as AssistmentsDataRepo.AssistmentsData
  })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('GetByObjectId succeeds', async () => {
    const foundAD = await AssistmentsDataRepo.getByObjectId(createdAD._id)

    expect(foundAD._id).toEqual(createdAD._id)
    expect(foundAD.session).toEqual(validSession._id)
  })

  test('GetByObjectId bubbles up errors from database find', async () => {
    const mockedAssistmentDataFind = jest.spyOn(
      AssistmentsDataRepo.AssistmentsDataModel,
      'findById'
    )
    const testError = new Error('Test error')
    mockedAssistmentDataFind.mockImplementationOnce(
      // @ts-expect-error
      mockMongooseFindQuery(() => {
        throw testError
      })
    )

    let error: RepoReadError
    try {
      await AssistmentsDataRepo.getByObjectId(createdAD._id)
    } catch (err) {
      error = err
    }

    // Assert error thrown
    expect(error instanceof RepoReadError).toBeTruthy()
    expect(error.message).toBe(testError.message)
  })

  test('GetAll succeeds', async () => {
    const foundAD = await AssistmentsDataRepo.AssistmentsDataModel.find()
      .lean()
      .exec()

    expect(foundAD.length).toEqual(1)
    expect(foundAD[0]._id).toEqual(createdAD._id)
    expect(foundAD[0].session).toEqual(validSession._id)
  })

  test('GetAll bubbles up errors from database find', async () => {
    const mockedAssistmentDataFind = jest.spyOn(
      AssistmentsDataRepo.AssistmentsDataModel,
      'find'
    )
    const testError = new Error('Test error')
    mockedAssistmentDataFind.mockImplementationOnce(
      // @ts-expect-error
      mockMongooseFindQuery(() => {
        throw testError
      })
    )

    let error: RepoReadError
    try {
      await AssistmentsDataRepo.getAll()
    } catch (err) {
      error = err
    }

    // Assert error thrown
    expect(error instanceof RepoReadError).toBeTruthy()
    expect(error.message).toBe(testError.message)
  })

  test('GetBySession succeeds for in-use session', async () => {
    const foundAD = await AssistmentsDataRepo.getBySession(validSession._id)

    expect(foundAD._id).toEqual(createdAD._id)
    expect(foundAD.session).toEqual(validSession._id)
  })

  test('GetBySession bubbles up errors from database find', async () => {
    const mockedAssistmentDataFind = jest.spyOn(
      AssistmentsDataRepo.AssistmentsDataModel,
      'findOne'
    )
    const testError = new Error('Test error')
    mockedAssistmentDataFind.mockImplementationOnce(
      // @ts-expect-error
      mockMongooseFindQuery(() => {
        throw testError
      })
    )

    let error: RepoReadError
    try {
      await AssistmentsDataRepo.getBySession(validSession._id)
    } catch (err) {
      error = err
    }

    // Assert error thrown
    expect(error instanceof RepoReadError).toBeTruthy()
    expect(error.message).toBe(testError.message)
  })
})

/*
describe('Update AssistmentData objects', () => {

})
*/

/*
describe('Delete AssistmentData objects', () => {

})
*/

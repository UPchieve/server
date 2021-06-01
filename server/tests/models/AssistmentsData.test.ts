import mongoose from 'mongoose'
import * as AssistmentsDataRepo from '../../models/AssistmentsData'
import SessionModel, { Session } from '../../models/Session'
import {
  RepoCreateError,
  RepoReadError,
} from '../../models/Errors' 
import {
  insertSession,
  resetDb
} from '../db-utils'


async function resetAD(): Promise<void> {
  await AssistmentsDataRepo.AssistmentsDataModel.deleteMany({})
}

function mockMongooseQuery(error: Error) {
  return () => ({
    lean: () => ({
      exec: async () => {
        throw error
      }
    })
  })
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

describe('Test create AssistmentData objects', () => {
  let validSession: Session
  let invalidSession: Session
  const problemId = 'test problem'
  const assignmentId = 'test assignment'

  beforeAll(async () => {
    await resetDb()
    await resetAD()
    const {
      session: newSession,
      student: newStudent
    } = await insertSession({}, {
      studentPartnerOrg: AssistmentsDataRepo.ASSISTMENTS
    })
    validSession = newSession
    const {
      session,
      student
    } = await insertSession({}, {})
    invalidSession = session
  })

  beforeEach(async () => {
    jest.resetAllMocks()
    await resetAD()
  })

  test('Create succeeds for valid session', async () => {
    const createdAD = await AssistmentsDataRepo.createBySession(
      problemId,
      assignmentId,
      validSession._id
    )

    const ad = await AssistmentsDataRepo.AssistmentsDataModel.findById(createdAD._id).lean().exec()
    expect(ad.session).toEqual(validSession._id)
  })

  test('Create errors with invalid session', async () => {
    let error: RepoCreateError
    try {
      const failedAD = await AssistmentsDataRepo.createBySession(
        problemId,
        assignmentId,
        invalidSession._id
      )
    } catch (err) {
      error = err
    }

    // Assert error thrown
    expect(error instanceof RepoCreateError).toBeTruthy()
    expect(error.message).toBe(
      `Session ${invalidSession._id} is not for an ASSISTments student`
    )
  })

  test('Create errors with re-used sessions', async () => {
    const createdAD = await AssistmentsDataRepo.createBySession(
      problemId,
      assignmentId,
      validSession._id
    )

    let error: RepoCreateError
    try {
      const failedAD = await AssistmentsDataRepo.createBySession(
        problemId,
        assignmentId,
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
    const mockedSessionRepoGetById = jest.spyOn(
      SessionModel,
      'findById'
    )
    const testError = new Error('Test error')
    mockedSessionRepoGetById.mockImplementationOnce(
      //@ts-expect-error
      mockMongooseQuery(testError)
    )

    let error: RepoReadError
    try {
      const failedAD = await AssistmentsDataRepo.createBySession(
        problemId,
        assignmentId,
        invalidSession._id
      )
    } catch (err) {
      error = err
    }

    expect(error instanceof RepoReadError)
    expect(error.message).toEqual(testError.message)
  })
})

describe('Test read AssistmentData objects', () => {
  let validSession: Session
  let createdAD: AssistmentsDataRepo.AssistmentsData
  const problemId = 'test problem'
  const assignmentId = 'test assignment'

  beforeAll(async () => {
    await resetDb()
    await resetAD()
    const {
      session: newSession,
      student: newStudent
    } = await insertSession({}, {
      studentPartnerOrg: AssistmentsDataRepo.ASSISTMENTS
    })
    validSession = newSession
    const newAD = await AssistmentsDataRepo.AssistmentsDataModel.create({
      problemId,
      assignmentId,
      session: validSession._id
    })
    createdAD = newAD.toObject() as AssistmentsDataRepo.AssistmentsData
  })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('GetById succeeds', async () => {
    const foundAD = await AssistmentsDataRepo.getById(createdAD._id)

    expect(foundAD._id).toEqual(createdAD._id)
    expect(foundAD.session).toEqual(validSession._id)
  })

  test('GetById bubbles up errors from database find', async () => {
    const mockedAssistmentDataFind = jest.spyOn(
      AssistmentsDataRepo.AssistmentsDataModel,
      'findById'
    )
    const testError = new Error('Test error')
    mockedAssistmentDataFind.mockImplementationOnce(
      //@ts-expect-error
      mockMongooseQuery(testError)
    )

    let error: RepoReadError
    try {
      const failedAD = await AssistmentsDataRepo.getById(createdAD._id)
    } catch (err) {
      error = err
    }

    // Assert error thrown
    expect(error instanceof RepoReadError).toBeTruthy()
    expect(error.message).toBe(testError.message)
  })

  test('GetAll succeeds', async () => {
    const foundAD = await AssistmentsDataRepo.AssistmentsDataModel.find().lean().exec()

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
      //@ts-expect-error
      mockMongooseQuery(testError)
    )

    let error: RepoReadError
    try {
      const failedAD = await AssistmentsDataRepo.getAll()
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
      //@ts-expect-error
      mockMongooseQuery(testError)
    )

    let error: RepoReadError
    try {
      const failedAD = await AssistmentsDataRepo.getBySession(validSession._id)
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
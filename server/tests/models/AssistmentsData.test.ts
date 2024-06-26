test.todo('postgres migration')
/*
import mongoose from 'mongoose'
import { v4 as uuid } from 'uuid'
import * as AssistmentsDataRepo from '../../models/AssistmentsData/queries'
import {
  AssistmentsDataModel,
  ASSISTMENTS,
  AssistmentsData,
} from '../../models/AssistmentsData'
import SessionModel, { Session } from '../../models/Session'
import {
  RepoCreateError,
  RepoReadError,
  RepoUpdateError,
} from '../../models/Errors'
import { insertSession, resetDb } from '../db-utils'
import { mockMongooseFindQuery } from '../utils'

async function resetAD(): Promise<void> {
  await AssistmentsDataModel.deleteMany({})
}

beforeAll(async () => {
  await mongoose.connect(global.__MONGO_URI__)
})

afterAll(async () => {
  await resetDb()
  await resetAD()
  await mongoose.connection.close()
})

beforeEach(() => {
  // reset spys between tests
  jest.restoreAllMocks()
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
        studentPartnerOrg: ASSISTMENTS,
      }
    )
    validSession = newSession
  })

  beforeEach(async () => {
    jest.resetAllMocks()
    await resetAD()
  })

  test('Create succeeds for valid session', async () => {
    const createdAD = await AssistmentsDataRepo.createAssistmentsDataBySession(
      problemId,
      assignmentId,
      studentId,
      validSession._id
    )

    const ad = await AssistmentsDataModel.findById(createdAD._id)
      .lean()
      .exec()
    expect(ad!.session).toEqual(validSession._id)
  })

  test('Create errors with invalid session', async () => {
    const invalidSessionId = new mongoose.Types.ObjectId() // unused Id

    let error: RepoCreateError
    try {
      await AssistmentsDataRepo.createAssistmentsDataBySession(
        problemId,
        assignmentId,
        studentId,
        invalidSessionId
      )
    } catch (err) {
      // Assert error thrown
      expect(err!).toBeTruthy()
      expect((err as RepoCreateError)!.message).toBe(
        `Session ${invalidSessionId} does not exist`
      )
    }
  })

  test('Create errors with re-used sessions', async () => {
    await AssistmentsDataRepo.createAssistmentsDataBySession(
      problemId,
      assignmentId,
      studentId,
      validSession._id
    )

    try {
      await AssistmentsDataRepo.createAssistmentsDataBySession(
        problemId,
        assignmentId,
        studentId,
        validSession._id
      )
    } catch (err) {
      expect(err!).toBeTruthy()
      expect((err as RepoCreateError).message).toBe(
        `AssistmentsData document for session ${validSession._id} already exists`
      )
    }
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
      await AssistmentsDataRepo.createAssistmentsDataBySession(
        problemId,
        assignmentId,
        studentId,
        validSession._id
      )
    } catch (err) {
      expect(err!).toBeTruthy()
      expect((err as RepoReadError).message).toContain(testError.message)
    }
  })
})

describe('Test read AssistmentData objects', () => {
  let validSession: Session
  let createdAD: AssistmentsData

  beforeAll(async () => {
    await resetDb()
    await resetAD()
    const { session: newSession } = await insertSession(
      {},
      {
        studentPartnerOrg: ASSISTMENTS,
      }
    )
    validSession = newSession
    const newAD = await AssistmentsDataModel.create({
      problemId,
      assignmentId,
      studentId,
      session: validSession._id,
    })
    createdAD = newAD.toObject() as AssistmentsData
  })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('GetByObjectId succeeds', async () => {
    const foundAD = await AssistmentsDataRepo.getAssistmentsDataByObjectId(
      createdAD._id
    )

    expect(foundAD!._id).toEqual(createdAD._id)
    expect(foundAD!.session).toEqual(validSession._id)
  })

  test('GetByObjectId bubbles up errors from database find', async () => {
    const mockedAssistmentDataFind = jest.spyOn(
      AssistmentsDataModel,
      'findById'
    )
    const testError = new Error('Test error')
    mockedAssistmentDataFind.mockImplementationOnce(
      // @ts-expect-error
      mockMongooseFindQuery(() => {
        throw testError
      })
    )

    try {
      await AssistmentsDataRepo.getAssistmentsDataByObjectId(createdAD._id)
    } catch (err) {
      // Assert error thrown
      expect(err!).toBeTruthy()
      expect((err as RepoReadError).message).toContain(testError.message)
    }
  })

  test('GetAll succeeds', async () => {
    const foundAD = await AssistmentsDataModel.find()
      .lean()
      .exec()

    expect(foundAD.length).toEqual(1)
    expect(foundAD[0]._id).toEqual(createdAD._id)
    expect(foundAD[0].session).toEqual(validSession._id)
  })

  test('GetAll bubbles up errors from database find', async () => {
    const mockedAssistmentDataFind = jest.spyOn(AssistmentsDataModel, 'find')
    const testError = new Error('Test error')
    mockedAssistmentDataFind.mockImplementationOnce(
      // @ts-expect-error
      mockMongooseFindQuery(() => {
        throw testError
      })
    )

    try {
      await AssistmentsDataRepo.getAllAssistmentsData()
    } catch (err) {
      // Assert error thrown
      expect(err instanceof RepoReadError).toBeTruthy()
      expect((err as RepoReadError).message).toContain(testError.message)
    }
  })

  test('GetBySession succeeds for in-use session', async () => {
    const foundAD = await AssistmentsDataRepo.getAssistmentsDataBySession(
      validSession._id
    )

    expect(foundAD!._id).toEqual(createdAD._id)
    expect(foundAD!.session).toEqual(validSession._id)
  })

  test('GetBySession bubbles up errors from database find', async () => {
    const mockedAssistmentDataFind = jest.spyOn(AssistmentsDataModel, 'findOne')
    const testError = new Error('Test error')
    mockedAssistmentDataFind.mockImplementationOnce(
      // @ts-expect-error
      mockMongooseFindQuery(() => {
        throw testError
      })
    )

    try {
      await AssistmentsDataRepo.getAssistmentsDataBySession(validSession._id)
    } catch (err) {
      // Assert error thrown
      expect(err!).toBeTruthy()
      expect((err as RepoReadError).message).toContain(testError.message)
    }
  })
})

describe('Update AssistmentData objects', () => {
  let validSession: Session
  let createdAD: AssistmentsData

  beforeAll(async () => {
    await resetDb()
    await resetAD()
    const { session: newSession } = await insertSession(
      {},
      {
        studentPartnerOrg: ASSISTMENTS,
      }
    )
    validSession = newSession
    const newAD = await AssistmentsDataModel.create({
      problemId,
      assignmentId,
      studentId,
      session: validSession._id,
    })
    createdAD = newAD.toObject() as AssistmentsData
  })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('updateAssistmentsDataSentAtById succeeds', async () => {
    const now = new Date()
    await AssistmentsDataRepo.updateAssistmentsDataSentAtById(
      createdAD._id,
      now
    )

    const foundAD = await AssistmentsDataModel.findById(createdAD._id)
      .lean()
      .exec()
    expect(foundAD!.sent).toBeTruthy()
    expect(foundAD!.sentAt).toEqual(now)
  })

  test('updateAssistmentsDataSentAtById wraps errors form database update', async () => {
    const mockedAssistmentDataUpdate = jest.spyOn(
      AssistmentsDataModel,
      'updateOne'
    )
    const testError = new Error('Test error')
    mockedAssistmentDataUpdate.mockRejectedValueOnce(testError)

    try {
      await AssistmentsDataRepo.updateAssistmentsDataSentAtById(
        createdAD._id,
        new Date()
      )
    } catch (err) {
      expect(err!).toBeInstanceOf(RepoUpdateError)
      expect((err as RepoReadError).message).toContain(testError.message)
    }
  })
})
*/

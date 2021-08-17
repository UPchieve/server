import mongoose from 'mongoose'
import * as UserSessionMetricsRepo from '../../models/UserSessionMetrics'
import UserModel, { User } from '../../models/User'
import {
  RepoCreateError,
  RepoReadError,
  RepoUpdateError
} from '../../models/Errors'
import { insertStudent, insertVolunteer, resetDb } from '../db-utils'
import { mockMongooseFindQuery, mockmongooseUpdateQuery } from '../utils'

async function resetUSM(): Promise<void> {
  await UserSessionMetricsRepo.UserSessionMetricsModel.deleteMany({})
}

let student: User
let volunteer: User

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  student = await insertStudent()
  volunteer = await insertVolunteer()
})

afterAll(async () => {
  await resetDb()
  await resetUSM()
  await mongoose.connection.close()
})

describe.only('Test create UserSessionModel objects', () => {
  beforeAll(async () => {
    await resetUSM()
  })

  beforeEach(async () => {
    jest.resetAllMocks()
    await resetUSM()
  })

  test('Create succeeds for student', async () => {
    const createdUsm = await UserSessionMetricsRepo.createByUser(student._id)

    const foundUsm = await UserSessionMetricsRepo.UserSessionMetricsModel.findById(
      createdUsm._id
    )
      .lean()
      .exec()
    expect(foundUsm.user).toEqual(student._id)
  })

  test('Create succeeds for volunteer', async () => {
    const createdUsm = await UserSessionMetricsRepo.createByUser(volunteer._id)

    const foundUsm = await UserSessionMetricsRepo.UserSessionMetricsModel.findById(
      createdUsm._id
    )
      .lean()
      .exec()
    expect(foundUsm.user).toEqual(volunteer._id)
  })

  test('Create errors with re-used user', async () => {
    expect.assertions(2)

    await UserSessionMetricsRepo.createByUser(student._id)

    try {
      await UserSessionMetricsRepo.createByUser(student._id)
    } catch (err) {
      expect(err).toBeInstanceOf(RepoCreateError)
      expect(err.message).toBe(
        `UserSessionMetrics document for user ${student._id} already exists`
      )
    }
  })

  test('Create errors with non-existent user', async () => {
    expect.assertions(2)

    const user = mongoose.Types.ObjectId()
    try {
      await UserSessionMetricsRepo.createByUser(user)
    } catch (err) {
      expect(err).toBeInstanceOf(RepoCreateError)
      expect(err.message).toBe(`User ${user} does not exist`)
    }
  })

  test('Create bubbles up errors from database find', async () => {
    expect.assertions(2)

    const mockedUserModelFind = jest.spyOn(UserModel, 'findById')
    const testError = new Error('Test error')
    mockedUserModelFind.mockImplementationOnce(
      // @ts-expect-error
      mockMongooseFindQuery(() => {
        throw testError
      })
    )

    try {
      await UserSessionMetricsRepo.createByUser(student._id)
    } catch (err) {
      expect(err).toBeInstanceOf(RepoCreateError)
      expect(err.message).toBe(testError.message)
    }
  })
})

describe('Test read UserSessionModel objects', () => {
  let createdUSM: UserSessionMetricsRepo.UserSessionMetrics

  beforeAll(async () => {
    await resetUSM()
    const newUSM = await UserSessionMetricsRepo.UserSessionMetricsModel.create({
      user: student._id
    })
    createdUSM = newUSM.toObject() as UserSessionMetricsRepo.UserSessionMetrics
  })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('GetByObjectId succeeds', async () => {
    const foundUSM = await UserSessionMetricsRepo.getByObjectId(createdUSM._id)

    expect(foundUSM._id).toEqual(createdUSM._id)
    expect(foundUSM.user).toEqual(student._id)
  })

  test('GetByObjectId bubbles up errors from database find', async () => {
    expect.assertions(2)

    const mockedUserSessionModelFind = jest.spyOn(
      UserSessionMetricsRepo.UserSessionMetricsModel,
      'findById'
    )
    const testError = new Error('Test error')
    mockedUserSessionModelFind.mockImplementationOnce(
      // @ts-expect-error
      mockMongooseFindQuery(() => {
        throw testError
      })
    )

    try {
      await UserSessionMetricsRepo.getByObjectId(createdUSM._id)
    } catch (err) {
      expect(err).toBeInstanceOf(RepoReadError)
      expect(err.message).toBe(testError.message)
    }
  })

  test('GetAll succeeds', async () => {
    const foundUSM = await UserSessionMetricsRepo.UserSessionMetricsModel.find()
      .lean()
      .exec()

    expect(foundUSM.length).toEqual(1)
    expect(foundUSM[0]._id).toEqual(createdUSM._id)
    expect(foundUSM[0].user).toEqual(student._id)
  })

  test('GetAll bubbles up errors from database find', async () => {
    expect.assertions(2)

    const mockedUserSessionModelFind = jest.spyOn(
      UserSessionMetricsRepo.UserSessionMetricsModel,
      'find'
    )
    const testError = new Error('Test error')
    mockedUserSessionModelFind.mockImplementationOnce(
      // @ts-expect-error
      mockMongooseFindQuery(() => {
        throw testError
      })
    )

    try {
      await UserSessionMetricsRepo.getAll()
    } catch (err) {
      expect(err).toBeInstanceOf(RepoReadError)
      expect(err.message).toBe(testError.message)
    }
  })

  test('GetByUser succeeds', async () => {
    const foundUSM = await UserSessionMetricsRepo.getByUser(student._id)

    expect(foundUSM._id).toEqual(createdUSM._id)
    expect(foundUSM.user).toEqual(student._id)
  })

  test('GetByUser bubbles up errors from database find', async () => {
    expect.assertions(2)

    const mockedUserSessionModelFind = jest.spyOn(
      UserSessionMetricsRepo.UserSessionMetricsModel,
      'findOne'
    )
    const testError = new Error('Test error')
    mockedUserSessionModelFind.mockImplementationOnce(
      // @ts-expect-error
      mockMongooseFindQuery(() => {
        throw testError
      })
    )

    try {
      await UserSessionMetricsRepo.getByUser(student._id)
    } catch (err) {
      expect(err).toBeInstanceOf(RepoReadError)
      expect(err.message).toBe(testError.message)
    }
  })
})

describe('Test read UserSessionModel objects', () => {
  let createdUSM: UserSessionMetricsRepo.UserSessionMetrics

  beforeAll(async () => {
    await resetUSM()
  })

  beforeEach(async () => {
    jest.resetAllMocks()
    await resetUSM()
    const newUSM = await UserSessionMetricsRepo.UserSessionMetricsModel.create({
      user: student._id
    })
    createdUSM = newUSM.toObject() as UserSessionMetricsRepo.UserSessionMetrics
  })

  test('incrementFlagCountByUser succeeds for valid flag', async () => {
    await UserSessionMetricsRepo.incrementFlagCountByUser(
      student._id,
      UserSessionMetricsRepo.FLAGS.absentStudentFlag
    )
    const foundUSM = await UserSessionMetricsRepo.getByObjectId(createdUSM._id)

    expect(foundUSM.flagCounts.absentStudentFlag).toEqual(1)
  })

  test('incrementFlagCountByUser bubbles up errors from database update', async () => {
    expect.assertions(2)

    const mockedUserSessionModelFind = jest.spyOn(
      UserSessionMetricsRepo.UserSessionMetricsModel,
      'updateOne'
    )
    const testError = new Error('Test error')
    mockedUserSessionModelFind.mockImplementationOnce(
      // @ts-expect-error
      mockmongooseUpdateQuery(() => {
        throw testError
      })
    )

    const flag = UserSessionMetricsRepo.FLAGS.absentStudentFlag
    try {
      await UserSessionMetricsRepo.incrementFlagCountByUser(student._id, flag)
    } catch (err) {
      expect(err).toBeInstanceOf(RepoUpdateError)
      expect(err.message).toBe(
        `Failed to increment session metric flag ${flag} for user ${student._id}: ${testError.message}`
      )
    }
  })

  test('incrementCounterByUser succeeds for valid counter', async () => {
    await UserSessionMetricsRepo.incrementCounterByUser(
      student._id,
      UserSessionMetricsRepo.COUNTERS.hasBeenUnmatched
    )
    const foundUSM = await UserSessionMetricsRepo.getByObjectId(createdUSM._id)

    expect(foundUSM.counters.hasBeenUnmatched).toEqual(1)
  })

  test('incrementCounterByUser bubbles up errors from database update', async () => {
    expect.assertions(2)

    const mockedUserSessionModelFind = jest.spyOn(
      UserSessionMetricsRepo.UserSessionMetricsModel,
      'updateOne'
    )
    const testError = new Error('Test error')
    mockedUserSessionModelFind.mockImplementationOnce(
      // @ts-expect-error
      mockmongooseUpdateQuery(() => {
        throw testError
      })
    )

    const counter = UserSessionMetricsRepo.COUNTERS.hasBeenUnmatched
    try {
      await UserSessionMetricsRepo.incrementCounterByUser(student._id, counter)
    } catch (err) {
      expect(err).toBeInstanceOf(RepoUpdateError)
      expect(err.message).toBe(
        `Failed to increment session metric counter ${counter} for user ${student._id}: ${testError.message}`
      )
    }
  })
})

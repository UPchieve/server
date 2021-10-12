import mongoose from 'mongoose'
import { merge } from 'lodash'
import * as UserSessionMetricsRepo from '../../models/UserSessionMetrics'
import UserModel, { User } from '../../models/User'
import {
  RepoCreateError,
  RepoReadError,
  RepoUpdateError
} from '../../models/Errors'
import { insertStudent, insertVolunteer, resetDb } from '../db-utils'
import { mockMongooseFindQuery } from '../utils'
import { getEnumKeyByEnumValue } from '../../utils/enum-utils'
import { USER_SESSION_METRICS } from '../../constants'

async function resetUSM(): Promise<void> {
  await UserSessionMetricsRepo.UserSessionMetricsModel.deleteMany({})
}

let student: User
let volunteer: User

beforeAll(async () => {
  await mongoose.connect(global.__MONGO_URI__, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  student = await insertStudent()
  volunteer = await insertVolunteer()
})

beforeEach(() => {
  // restore spys between tests
  jest.restoreAllMocks()
})

afterAll(async () => {
  await resetDb()
  await resetUSM()
  await mongoose.connection.close()
})

describe('Test create UserSessionModel objects', () => {
  beforeAll(async () => {
    await resetUSM()
  })

  beforeEach(async () => {
    jest.resetAllMocks()
    await resetUSM()
  })

  test('Create succeeds for student', async () => {
    const createdUSM = await UserSessionMetricsRepo.createByUserId(student._id)

    const foundUSM = await UserSessionMetricsRepo.UserSessionMetricsModel.findById(
      createdUSM._id
    )
      .lean()
      .exec()
    expect(foundUSM.user).toEqual(student._id)
  })

  test('Create succeeds for volunteer', async () => {
    const createdUSM = await UserSessionMetricsRepo.createByUserId(
      volunteer._id
    )

    const foundUSM = await UserSessionMetricsRepo.UserSessionMetricsModel.findById(
      createdUSM._id
    )
      .lean()
      .exec()
    expect(foundUSM.user).toEqual(volunteer._id)
  })

  test('Create errors with re-used user', async () => {
    await UserSessionMetricsRepo.createByUserId(student._id)

    let error: RepoCreateError
    try {
      await UserSessionMetricsRepo.createByUserId(student._id)
    } catch (err) {
      error = err
    }

    expect(error).toBeInstanceOf(RepoCreateError)
    expect(error.message).toBe(
      `UserSessionMetrics document for user ${student._id} already exists`
    )
  })

  test('Create errors with non-existent user', async () => {
    const user = mongoose.Types.ObjectId()

    let error: RepoCreateError
    try {
      await UserSessionMetricsRepo.createByUserId(user)
    } catch (err) {
      error = err
    }
    expect(error).toBeInstanceOf(RepoCreateError)
    expect(error.message).toBe(`User ${user} does not exist`)
  })

  test('Create errors with no data returned from db', async () => {
    const mockedUserSessionModelCreate = jest.spyOn(
      UserSessionMetricsRepo.UserSessionMetricsModel,
      'create'
    )
    // MongooseModel.create has multiple overloads which return type 'void'
    // jest interprets this as never leading to this weird typecast
    mockedUserSessionModelCreate.mockResolvedValueOnce(undefined as never)

    let error: RepoCreateError
    try {
      await UserSessionMetricsRepo.createByUserId(student._id)
    } catch (err) {
      error = err
    }

    expect(error).toBeInstanceOf(RepoCreateError)
    expect(error.message).toBe('Create query did not return created object')
  })

  test('Create bubbles up errors from database find', async () => {
    const mockedUserModelFind = jest.spyOn(UserModel, 'findById')
    const testError = new Error('Test error')
    mockedUserModelFind.mockImplementationOnce(
      // @ts-expect-error
      mockMongooseFindQuery(() => {
        throw testError
      })
    )

    await expect(
      UserSessionMetricsRepo.createByUserId(student._id)
    ).rejects.toThrow(testError)
  })

  test('Create wraps errors from database creation', async () => {
    const mockedUserSessionModelCreate = jest.spyOn(
      UserSessionMetricsRepo.UserSessionMetricsModel,
      'create'
    )
    const testError = new Error('Test error')
    // MongooseModel.create has multiple overloads which return type 'void'
    // jest interprets this as never leading to this weird typecast
    mockedUserSessionModelCreate.mockRejectedValueOnce(testError as never)

    let error: RepoCreateError
    try {
      await UserSessionMetricsRepo.createByUserId(student._id)
    } catch (err) {
      error = err
    }

    expect(error).toBeInstanceOf(RepoCreateError)
    expect(error.message).toBe(testError.message)
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

  test('GetByObjectId wraps errors from database find', async () => {
    const mockedUserSessionMetricsModelFind = jest.spyOn(
      UserSessionMetricsRepo.UserSessionMetricsModel,
      'findById'
    )
    const testError = new Error('Test error')
    mockedUserSessionMetricsModelFind.mockImplementationOnce(
      // @ts-expect-error
      mockMongooseFindQuery(() => {
        throw testError
      })
    )

    let error: RepoReadError
    try {
      await UserSessionMetricsRepo.getByObjectId(createdUSM._id)
    } catch (err) {
      error = err
    }

    expect(error).toBeInstanceOf(RepoReadError)
    expect(error.message).toBe(testError.message)
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
    const mockedUserSessionMetricsModelFind = jest.spyOn(
      UserSessionMetricsRepo.UserSessionMetricsModel,
      'find'
    )
    const testError = new Error('Test error')
    mockedUserSessionMetricsModelFind.mockImplementationOnce(
      // @ts-expect-error
      mockMongooseFindQuery(() => {
        throw testError
      })
    )

    let error: RepoReadError
    try {
      await UserSessionMetricsRepo.getAll()
    } catch (err) {
      error = err
    }

    expect(error).toBeInstanceOf(RepoReadError)
    expect(error.message).toBe(testError.message)
  })

  test('GetByUserId succeeds', async () => {
    const foundUSM = await UserSessionMetricsRepo.getByUserId(student._id)

    expect(foundUSM._id).toEqual(createdUSM._id)
    expect(foundUSM.user).toEqual(student._id)
  })

  test('GetByUserId bubbles up errors from database find', async () => {
    const mockedUserSessionMetricsModelFind = jest.spyOn(
      UserSessionMetricsRepo.UserSessionMetricsModel,
      'findOne'
    )
    const testError = new Error('Test error')
    mockedUserSessionMetricsModelFind.mockImplementationOnce(
      // @ts-expect-error
      mockMongooseFindQuery(() => {
        throw testError
      })
    )

    let error: RepoReadError
    try {
      await UserSessionMetricsRepo.getByUserId(student._id)
    } catch (err) {
      error = err
    }

    expect(error).toBeInstanceOf(RepoReadError)
    expect(error.message).toBe(testError.message)
  })
})

describe('Test update UserSessionModel objects', () => {
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

  test('executeUpdatesByUserId succeeds for valid queries', async () => {
    const queries = [
      {
        [`counters.${getEnumKeyByEnumValue(
          USER_SESSION_METRICS,
          USER_SESSION_METRICS.absentStudent
        )}`]: 2
      },
      {
        [`counters.${getEnumKeyByEnumValue(
          USER_SESSION_METRICS,
          USER_SESSION_METRICS.hasHadTechnicalIssues
        )}`]: 5
      }
    ]
    await UserSessionMetricsRepo.executeUpdatesByUserId(student._id, queries)
    const foundUSM = await UserSessionMetricsRepo.getByObjectId(createdUSM._id)

    for (const query of queries) {
      for (const key in query) {
        const [type, path]: string[] = key.split('.')
        expect(foundUSM[type][path]).toEqual(query[key])
      }
    }
  })

  test('executeUpdatesByUserId fails for invalid queries', async () => {
    const queries = [
      { yipee: 2 },
      {
        [`counters.${USER_SESSION_METRICS.hasHadTechnicalIssues}`]: 5
      }
    ]
    const update = merge(queries[0], queries[1])
    const user = student._id
    let error: RepoUpdateError
    try {
      await UserSessionMetricsRepo.executeUpdatesByUserId(user, queries)
    } catch (err) {
      error = err
    }

    expect(error).toBeInstanceOf(RepoUpdateError)
    expect(error.message).toContain(
      `Failed to execute update ${update} for user ${user}:`
    )
  })

  test('executeUpdatesByUserId wraps errors from database update', async () => {
    const mockedUserSessionMetricsModelUpdate = jest.spyOn(
      UserSessionMetricsRepo.UserSessionMetricsModel,
      'updateOne'
    )
    const testError = new Error('Test error')
    mockedUserSessionMetricsModelUpdate.mockRejectedValueOnce(testError)

    const queries = [
      { [`counters.${USER_SESSION_METRICS.absentStudent}`]: 2 },
      {
        [`counters.${USER_SESSION_METRICS.hasHadTechnicalIssues}`]: 5
      }
    ]
    const update = merge(queries[0], queries[1])
    const user = student._id
    let error: RepoUpdateError
    try {
      await UserSessionMetricsRepo.executeUpdatesByUserId(user, queries)
    } catch (err) {
      error = err
    }

    expect(error).toBeInstanceOf(RepoUpdateError)
    expect(error.message).toBe(
      `Failed to execute update ${update} for user ${user}: ${testError.message}`
    )
  })
})

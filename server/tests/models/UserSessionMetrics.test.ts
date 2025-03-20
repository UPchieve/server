test.todo('postgres migration')
/*import mongoose from 'mongoose'
import { merge } from 'lodash'
import {
  UserSessionMetricsModel,
  UserSessionMetrics,
} from '../../models/UserSessionMetrics'
import * as UserSessionMetricsRepo from '../../models/UserSessionMetrics/queries'
import UserModel, { User } from '../../models/User'
import {
  RepoCreateError,
  RepoReadError,
  RepoUpdateError,
} from '../../models/Errors'
import { insertStudent, insertVolunteer, resetDb } from '../db-utils'
import { mockMongooseFindQuery } from '../utils'
import { getEnumKeyByEnumValue } from '../../utils/enum-utils'
import { USER_SESSION_METRICS } from '../../constants'

async function resetUSM(): Promise<void> {
  await UserSessionMetricsModel.deleteMany({})
}

let student: User
let volunteer: User

beforeAll(async () => {
  await mongoose.connect(global.__MONGO_URI__)
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
    const createdUSM = await UserSessionMetricsRepo.createUSMByUserId(
      student._id
    )

    const foundUSM = await UserSessionMetricsModel.findById(createdUSM._id)
      .lean()
      .exec()
    expect(foundUSM!.user).toEqual(student._id)
  })

  test('Create succeeds for volunteer', async () => {
    const createdUSM = await UserSessionMetricsRepo.createUSMByUserId(
      volunteer._id
    )

    const foundUSM = await UserSessionMetricsModel.findById(createdUSM._id)
      .lean()
      .exec()
    expect(foundUSM!.user).toEqual(volunteer._id)
  })

  test('Create errors with re-used user', async () => {
    await UserSessionMetricsRepo.createUSMByUserId(student._id)

    let error: RepoCreateError
    try {
      await UserSessionMetricsRepo.createUSMByUserId(student._id)
    } catch (err) {
      error = err as Error
    }

    expect(error!).toBeInstanceOf(RepoCreateError)
    expect((error! as RepoCreateError).message).toContain(
      `UserSessionMetrics document for user ${student._id} already exists`
    )
  })

  test('Create errors with non-existent user', async () => {
    const user = new mongoose.Types.ObjectId()

    let error: RepoCreateError
    try {
      await UserSessionMetricsRepo.createUSMByUserId(user)
    } catch (err) {
      error = err as Error
    }
    expect(error!).toBeInstanceOf(RepoCreateError)
    expect((error! as RepoCreateError).message).toContain(
      `User ${user} does not exist`
    )
  })

  test('Create errors with no data returned from db', async () => {
    const mockedUserSessionModelCreate = jest.spyOn(
      UserSessionMetricsModel,
      'create'
    )
    // MongooseModel.create has multiple overloads which return type 'void'
    // jest interprets this as never leading to this weird typecast
    mockedUserSessionModelCreate.mockResolvedValueOnce(undefined as never)

    let error: RepoCreateError
    try {
      await UserSessionMetricsRepo.createUSMByUserId(student._id)
    } catch (err) {
      error = err as Error
    }

    expect(error!).toBeInstanceOf(RepoCreateError)
    expect((error! as RepoCreateError).message).toBe(
      'Create query did not return created object'
    )
  })

  test('Create bubbles up errors from database find', async () => {
    const mockedUserModelFind = jest.spyOn(UserModel, 'findOne')
    const testError = new Error('Test error')
    mockedUserModelFind.mockImplementationOnce(
      // @ts-expect-error
      mockMongooseFindQuery(() => {
        throw testError
      })
    )

    await expect(
      UserSessionMetricsRepo.createUSMByUserId(student._id)
    ).rejects.toThrow(testError)
  })

  test('Create wraps errors from database creation', async () => {
    const mockedUserSessionModelCreate = jest.spyOn(
      UserSessionMetricsModel,
      'create'
    )
    const testError = new Error('Test error')
    // MongooseModel.create has multiple overloads which return type 'void'
    // jest interprets this as never leading to this weird typecast
    mockedUserSessionModelCreate.mockRejectedValueOnce(testError as never)

    let error: RepoCreateError
    try {
      await UserSessionMetricsRepo.createUSMByUserId(student._id)
    } catch (err) {
      error = err as Error
    }

    expect(error!).toBeInstanceOf(RepoCreateError)
    expect((error! as RepoCreateError).message).toContain(testError.message)
  })
})

describe('Test read UserSessionModel objects', () => {
  let createdUSM: UserSessionMetrics

  beforeAll(async () => {
    await resetUSM()
    const newUSM = await UserSessionMetricsModel.create({
      user: student._id,
    })
    createdUSM = newUSM.toObject() as UserSessionMetrics
  })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('GetById succeeds', async () => {
    const foundUSM = await UserSessionMetricsRepo.getUSMById(createdUSM._id)

    expect(foundUSM!._id).toEqual(createdUSM._id)
    expect(foundUSM!.user).toEqual(student._id)
  })

  test('GetById wraps errors from database find', async () => {
    const mockedUserSessionMetricsModelFind = jest.spyOn(
      UserSessionMetricsModel,
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
      await UserSessionMetricsRepo.getUSMById(createdUSM._id)
    } catch (err) {
      error = err as Error
    }

    expect(error!).toBeInstanceOf(RepoReadError)
    expect((error! as RepoReadError).message).toContain(testError.message)
  })

  test('GetAll bubbles up errors from database find', async () => {
    const mockedUserSessionMetricsModelFind = jest.spyOn(
      UserSessionMetricsModel,
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
      await UserSessionMetricsRepo.getAllUSM()
    } catch (err) {
      error = err as Error
    }

    expect(error!).toBeInstanceOf(RepoReadError)
    expect((error! as RepoReadError).message).toContain(testError.message)
  })

  test('GetByUserId succeeds', async () => {
    const foundUSM = await UserSessionMetricsRepo.getUSMByUserId(student._id)

    expect(foundUSM!._id).toEqual(createdUSM._id)
    expect(foundUSM!.user).toEqual(student._id)
  })

  test('GetByUserId bubbles up errors from database find', async () => {
    const mockedUserSessionMetricsModelFind = jest.spyOn(
      UserSessionMetricsModel,
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
      await UserSessionMetricsRepo.getUSMByUserId(student._id)
    } catch (err) {
      error = err as Error
    }

    expect(error!).toBeInstanceOf(RepoReadError)
    expect((error! as RepoReadError).message).toContain(testError.message)
  })
})

describe('Test update UserSessionModel objects', () => {
  let createdUSM: UserSessionMetrics

  beforeAll(async () => {
    await resetUSM()
  })

  beforeEach(async () => {
    jest.resetAllMocks()
    await resetUSM()
    const newUSM = await UserSessionMetricsModel.create({
      user: student._id,
    })
    createdUSM = newUSM.toObject() as UserSessionMetrics
  })

  test('executeUpdatesByUserId succeeds for valid queries', async () => {
    const queries = [
      {
        [`counters.${getEnumKeyByEnumValue(
          USER_SESSION_METRICS,
          USER_SESSION_METRICS.absentStudent
        )}`]: 2,
      },
      {
        [`counters.${getEnumKeyByEnumValue(
          USER_SESSION_METRICS,
          USER_SESSION_METRICS.hasHadTechnicalIssues
        )}`]: 5,
      },
    ]
    await UserSessionMetricsRepo.executeUSMUpdatesByUserId(student._id, queries)
    const foundUSM = await UserSessionMetricsRepo.getUSMById(createdUSM._id)

    for (const query of queries) {
      for (const key in query) {
        const [type, path]: string[] = key.split('.')
        expect(((foundUSM! as any)[type]! as any)[path]! as string).toEqual(
          query[key]
        )
      }
    }
  })

  test('executeUpdatesByUserId fails for invalid queries', async () => {
    const queries = [
      { yipee: 2 },
      {
        [`counters.${USER_SESSION_METRICS.hasHadTechnicalIssues}`]: 5,
      },
    ]
    const update = merge(queries[0], queries[1])
    const user = student._id
    let error: RepoUpdateError
    try {
      await UserSessionMetricsRepo.executeUSMUpdatesByUserId(user, queries)
    } catch (err) {
      error = err as Error
    }

    expect(error!).toBeInstanceOf(RepoUpdateError)
    expect((error! as RepoUpdateError).message).toContain(
      `Failed to execute merged update ${update} for user ${user}:`
    )
  })

  test('executeUpdatesByUserId wraps errors from database update', async () => {
    const mockedUserSessionMetricsModelUpdate = jest.spyOn(
      UserSessionMetricsModel,
      'updateOne'
    )
    const testError = new Error('Test error')
    mockedUserSessionMetricsModelUpdate.mockRejectedValueOnce(testError)

    const queries = [
      { [`counters.${USER_SESSION_METRICS.absentStudent}`]: 2 },
      {
        [`counters.${USER_SESSION_METRICS.hasHadTechnicalIssues}`]: 5,
      },
    ]
    const update = merge(queries[0], queries[1])
    const user = student._id
    let error: RepoUpdateError
    try {
      await UserSessionMetricsRepo.executeUSMUpdatesByUserId(user, queries)
    } catch (err) {
      error = err as Error
    }

    expect(error!).toBeInstanceOf(RepoUpdateError)
    expect((error! as RepoUpdateError).message).toContain(
      `Failed to execute merged update ${update} for user ${user}: ${testError.message}`
    )
  })
})
*/

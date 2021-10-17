import mongoose from 'mongoose'
import * as UserProductFlagsRepo from '../../models/UserProductFlags'
import UserModel, { User } from '../../models/User'
import { RepoCreateError, RepoReadError } from '../../models/Errors'
import { insertStudent, insertVolunteer, resetDb } from '../db-utils'
import { mockMongooseFindQuery } from '../utils'

async function resetUPF(): Promise<void> {
  await UserProductFlagsRepo.UserProductFlagsModel.deleteMany({})
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
  await resetUPF()
  await mongoose.connection.close()
})

describe('Test create UserProductFlag model documents', () => {
  beforeEach(async () => {
    jest.resetAllMocks()
    await resetUPF()
  })

  test('Create succeeds for student', async () => {
    const createdUPF = await UserProductFlagsRepo.createByUserId(student._id)

    const result = await UserProductFlagsRepo.UserProductFlagsModel.findById(
      createdUPF._id
    )
      .lean()
      .exec()
    expect(result.user).toEqual(student._id)
  })

  test('Create succeeds for volunteer', async () => {
    const createdUPF = await UserProductFlagsRepo.createByUserId(volunteer._id)

    const result = await UserProductFlagsRepo.UserProductFlagsModel.findById(
      createdUPF._id
    )
      .lean()
      .exec()
    expect(result.user).toEqual(volunteer._id)
  })

  test('Create errors with re-used user', async () => {
    await UserProductFlagsRepo.createByUserId(student._id)

    let error: RepoCreateError
    try {
      await UserProductFlagsRepo.createByUserId(student._id)
    } catch (err) {
      error = err
    }

    expect(error).toBeInstanceOf(RepoCreateError)
    expect(error.message).toBe(
      `UserProductFlags document for user ${student._id} already exists`
    )
  })

  test('Create errors with non-existent user', async () => {
    const user = mongoose.Types.ObjectId()

    let error: RepoCreateError
    try {
      await UserProductFlagsRepo.createByUserId(user)
    } catch (err) {
      error = err
    }
    expect(error).toBeInstanceOf(RepoCreateError)
    expect(error.message).toBe(`User ${user} does not exist`)
  })

  test('Create errors with no data returned from db', async () => {
    const mockedUserProductModelCreate = jest.spyOn(
      UserProductFlagsRepo.UserProductFlagsModel,
      'create'
    )
    // MongooseModel.create has multiple overloads which return type 'void'
    // jest interprets this as never leading to this weird typecast
    mockedUserProductModelCreate.mockResolvedValueOnce(undefined as never)

    let error: RepoCreateError
    try {
      await UserProductFlagsRepo.createByUserId(student._id)
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
      UserProductFlagsRepo.createByUserId(student._id)
    ).rejects.toThrow(testError)
  })

  test('Create wraps errors from database creation', async () => {
    const mockedUserProductModelCreate = jest.spyOn(
      UserProductFlagsRepo.UserProductFlagsModel,
      'create'
    )
    const testError = new Error('Test error')
    // MongooseModel.create has multiple overloads which return type 'void'
    // jest interprets this as never leading to this weird typecast
    mockedUserProductModelCreate.mockRejectedValueOnce(testError as never)

    let error: RepoCreateError
    try {
      await UserProductFlagsRepo.createByUserId(student._id)
    } catch (err) {
      error = err
    }

    expect(error).toBeInstanceOf(RepoCreateError)
    expect(error.message).toBe(testError.message)
  })
})

describe('Test read UserProductFlag documents', () => {
  let createdUPF: UserProductFlagsRepo.UserProductFlags

  beforeAll(async () => {
    await resetUPF()
    const newUPF = await UserProductFlagsRepo.UserProductFlagsModel.create({
      user: student._id
    })
    createdUPF = newUPF.toObject() as UserProductFlagsRepo.UserProductFlags
  })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('GetByObjectId succeeds', async () => {
    const result = await UserProductFlagsRepo.getByObjectId(createdUPF._id)

    expect(result._id).toEqual(createdUPF._id)
    expect(result.user).toEqual(student._id)
  })

  test('GetByObjectId wraps errors from database find', async () => {
    const mockedUserProductFlagsModelFind = jest.spyOn(
      UserProductFlagsRepo.UserProductFlagsModel,
      'findById'
    )
    const testError = new Error('Test error')
    mockedUserProductFlagsModelFind.mockImplementationOnce(
      // @ts-expect-error
      mockMongooseFindQuery(() => {
        throw testError
      })
    )

    let error: RepoReadError
    try {
      await UserProductFlagsRepo.getByObjectId(createdUPF._id)
    } catch (err) {
      error = err
    }

    expect(error).toBeInstanceOf(RepoReadError)
    expect(error.message).toBe(testError.message)
  })

  test('GetAll succeeds', async () => {
    const result = await UserProductFlagsRepo.UserProductFlagsModel.find()
      .lean()
      .exec()

    expect(result.length).toEqual(1)
    expect(result[0]._id).toEqual(createdUPF._id)
    expect(result[0].user).toEqual(student._id)
  })

  test('GetAll bubbles up errors from database find', async () => {
    const mockedUserProductFlagsModelFind = jest.spyOn(
      UserProductFlagsRepo.UserProductFlagsModel,
      'find'
    )
    const testError = new Error('Test error')
    mockedUserProductFlagsModelFind.mockImplementationOnce(
      // @ts-expect-error
      mockMongooseFindQuery(() => {
        throw testError
      })
    )

    let error: RepoReadError
    try {
      await UserProductFlagsRepo.getAll()
    } catch (err) {
      error = err
    }

    expect(error).toBeInstanceOf(RepoReadError)
    expect(error.message).toBe(testError.message)
  })

  test('GetByUserId succeeds', async () => {
    const result = await UserProductFlagsRepo.getByUserId(student._id)

    expect(result._id).toEqual(createdUPF._id)
    expect(result.user).toEqual(student._id)
  })

  test('GetByUserId bubbles up errors from database find', async () => {
    const mockedUserProductFlagsModelFind = jest.spyOn(
      UserProductFlagsRepo.UserProductFlagsModel,
      'findOne'
    )
    const testError = new Error('Test error')
    mockedUserProductFlagsModelFind.mockImplementationOnce(
      // @ts-expect-error
      mockMongooseFindQuery(() => {
        throw testError
      })
    )

    let error: RepoReadError
    try {
      await UserProductFlagsRepo.getByUserId(student._id)
    } catch (err) {
      error = err
    }

    expect(error).toBeInstanceOf(RepoReadError)
    expect(error.message).toBe(testError.message)
  })
})

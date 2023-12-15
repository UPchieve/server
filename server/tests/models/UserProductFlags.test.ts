test.todo('postgres migration')
/*import mongoose from 'mongoose'
import * as UserProductFlagsRepo from '../../models/UserProductFlags/queries'
import UserProductFlagsModel, {
  UserProductFlags,
} from '../../models/UserProductFlags'
import UserModel, { User } from '../../models/User'
import { RepoCreateError, RepoReadError } from '../../models/Errors'
import { insertStudent, insertVolunteer, resetDb } from '../db-utils'
import { mockMongooseFindQuery } from '../utils'

async function resetUPF(): Promise<void> {
  await UserProductFlagsModel.deleteMany({})
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
  await resetUPF()
  await mongoose.connection.close()
})

describe('Test create UserProductFlag model documents', () => {
  beforeEach(async () => {
    jest.resetAllMocks()
    await resetUPF()
  })

  test('Create succeeds for student', async () => {
    const createdUPF = await UserProductFlagsRepo.createUPFByUserId(student._id)

    const result = await UserProductFlagsModel.findById(createdUPF._id)
      .lean()
      .exec()
    expect(result!.user).toEqual(student._id)
  })

  test('Create succeeds for volunteer', async () => {
    const createdUPF = await UserProductFlagsRepo.createUPFByUserId(
      volunteer._id
    )

    const result = await UserProductFlagsModel.findById(createdUPF._id)
      .lean()
      .exec()
    expect(result!.user).toEqual(volunteer._id)
  })

  test('Create errors with re-used user', async () => {
    await UserProductFlagsRepo.createUPFByUserId(student._id)

    let error: RepoCreateError
    try {
      await UserProductFlagsRepo.createUPFByUserId(student._id)
    } catch (err) {
      error = err as Error
    }

    expect(error!).toBeInstanceOf(RepoCreateError)
    expect((error! as RepoCreateError).message).toBe(
      `UserProductFlags document for user ${student._id} already exists`
    )
  })

  test('Create errors with non-existent user', async () => {
    const user = new mongoose.Types.ObjectId()

    let error: RepoCreateError
    try {
      await UserProductFlagsRepo.createUPFByUserId(user)
    } catch (err) {
      error = err as Error
    }
    expect(error!).toBeInstanceOf(RepoCreateError)
    expect((error! as RepoCreateError).message).toBe(
      `User ${user} does not exist`
    )
  })

  test('Create errors with no data returned from db', async () => {
    const mockedUserProductModelCreate = jest.spyOn(
      UserProductFlagsModel,
      'create'
    )
    // MongooseModel.create has multiple overloads which return type 'void'
    // jest interprets this as never leading to this weird typecast
    mockedUserProductModelCreate.mockResolvedValueOnce(undefined as never)

    let error: RepoCreateError
    try {
      await UserProductFlagsRepo.createUPFByUserId(student._id)
    } catch (err) {
      error = err as Error
    }

    expect(error!).toBeInstanceOf(RepoCreateError)
    expect((error! as RepoCreateError).message).toBe(
      'Create query did not return created object'
    )
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
      UserProductFlagsRepo.createUPFByUserId(student._id)
    ).rejects.toThrow(testError)
  })

  test('Create wraps errors from database creation', async () => {
    const mockedUserProductModelCreate = jest.spyOn(
      UserProductFlagsModel,
      'create'
    )
    const testError = new Error('Test error')
    // MongooseModel.create has multiple overloads which return type 'void'
    // jest interprets this as never leading to this weird typecast
    mockedUserProductModelCreate.mockRejectedValueOnce(testError as never)

    let error: RepoCreateError
    try {
      await UserProductFlagsRepo.createUPFByUserId(student._id)
    } catch (err) {
      error = err as Error
    }

    expect(error!).toBeInstanceOf(RepoCreateError)
    expect((error! as RepoCreateError).message).toContain(testError.message)
  })
})

describe('Test read UserProductFlag documents', () => {
  let createdUPF: UserProductFlags

  beforeAll(async () => {
    await resetUPF()
    const newUPF = await UserProductFlagsModel.create({
      user: student._id,
    })
    createdUPF = newUPF.toObject() as UserProductFlags
  })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('GetByObjectId succeeds', async () => {
    const result = await UserProductFlagsRepo.getUPFByObjectId(createdUPF._id)

    expect(result!._id).toEqual(createdUPF._id)
    expect(result!.user).toEqual(student._id)
  })

  test('GetByObjectId wraps errors from database find', async () => {
    const mockedUserProductFlagsModelFind = jest.spyOn(
      UserProductFlagsModel,
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
      await UserProductFlagsRepo.getUPFByObjectId(createdUPF._id)
    } catch (err) {
      error = err as Error
    }

    expect(error!).toBeInstanceOf(RepoReadError)
    expect((error! as RepoReadError).message).toContain(testError.message)
  })

  test('GetAll succeeds', async () => {
    const result = await UserProductFlagsModel.find()
      .lean()
      .exec()

    expect(result.length).toEqual(1)
    expect(result[0]._id).toEqual(createdUPF._id)
    expect(result[0].user).toEqual(student._id)
  })

  test('GetAll bubbles up errors from database find', async () => {
    const mockedUserProductFlagsModelFind = jest.spyOn(
      UserProductFlagsModel,
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
      await UserProductFlagsRepo.getAllUPF()
    } catch (err) {
      error = err as Error
    }

    expect(error!).toBeInstanceOf(RepoReadError)
    expect((error! as RepoReadError).message).toContain(testError.message)
  })

  test('GetByUserId succeeds', async () => {
    const result = await UserProductFlagsRepo.getUPFByUserId(student._id)

    expect(result!._id).toEqual(createdUPF._id)
    expect(result!.user).toEqual(student._id)
  })

  test('GetByUserId bubbles up errors from database find', async () => {
    const mockedUserProductFlagsModelFind = jest.spyOn(
      UserProductFlagsModel,
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
      await UserProductFlagsRepo.getUPFByUserId(student._id)
    } catch (err) {
      error = err as Error
    }

    expect(error!).toBeInstanceOf(RepoReadError)
    expect((error! as RepoReadError).message).toContain(testError.message)
  })
})
*/

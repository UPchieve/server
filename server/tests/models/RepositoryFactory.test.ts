import mongoose from 'mongoose'
import { RepoCreateError, RepoReadError } from '../../models/Errors'
import {
  resetTestData,
  InnerData,
  TestData,
  InnerDataRepo,
  TestDataRepo,
  InnerDataModel,
  TestDataModel
} from './TestModel'

// @todo: create an actual generic mongoose model mock to get the proper typing
function mockMongooseFindQuery(fn: Function) {
  return () => ({
    lean: () => ({
      exec: async () => {
        await fn()
      }
    })
  })
}

// Test setup
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
})

beforeEach(async () => {
  jest.resetAllMocks()
  await resetTestData()
})

// Test teardown
afterAll(async () => {
  await resetTestData()
  await mongoose.connection.close()
})

// Test objects
const innerTemplate = {
  data: 'inner data'
} as Partial<InnerData>
const testTemplate = {
  baseData: 'base data',
  arrayData: ['first', 'second']
} as Partial<TestData>

// Test suites
describe('Test create factory', () => {
  beforeAll(async () => {
    jest.resetAllMocks()
    await resetTestData()
  })

  beforeEach(async () => {
    jest.resetAllMocks()
    await resetTestData()
  })

  test('Create succeeds', async () => {
    const createdInnerData = await InnerDataRepo.create(innerTemplate)
    const createdTestData = await TestDataRepo.create({
      ...testTemplate,
      innerData: createdInnerData._id
    })

    const foundTestData = await TestDataModel.findById(createdTestData._id)
      .lean()
      .exec()
    expect(foundTestData.baseData).toEqual(testTemplate.baseData)
    expect(foundTestData.arrayData).toEqual(testTemplate.arrayData)
    expect(createdTestData.innerData).toEqual(createdInnerData._id)
  })

  test('Create bubbles up errors from database insert', async () => {
    const mockedInnerDataInsert = jest.spyOn(InnerDataModel, 'create')
    const testError = new Error('Test error')
    mockedInnerDataInsert.mockImplementationOnce(async () => {
      throw testError
    })

    let error: RepoCreateError
    try {
      await InnerDataRepo.create(innerTemplate)
    } catch (err) {
      error = err
    }

    expect(error instanceof RepoCreateError)
    expect(error.message).toBe(testError.message)
  })
})

describe('Test read factory', () => {
  let innerDataObject: InnerData
  let testDataObject1: TestData
  let testDataObject2: TestData

  beforeAll(async () => {
    jest.resetAllMocks()
    await resetTestData()

    const innerData = await InnerDataModel.create(innerTemplate)
    innerDataObject = innerData.toObject()
    const testData1 = await TestDataModel.create({
      ...testTemplate,
      innerData: innerDataObject._id
    })
    testDataObject1 = testData1.toObject()
    const testData2 = await TestDataModel.create({
      ...testTemplate,
      innerData: innerDataObject._id,
      baseData: 'other'
    })
    testDataObject2 = testData2.toObject()
  })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('GetById succeeds', async () => {
    const foundTestData = await TestDataRepo.getById(testDataObject1._id)

    expect(foundTestData.baseData).toEqual(testDataObject1.baseData)
    expect(foundTestData.arrayData).toEqual(testDataObject1.arrayData)
    expect(foundTestData.innerData).toEqual(innerDataObject._id)
  })

  test('GetById bubbles up errors from database find', async () => {
    const mockedInnerDataFind = jest.spyOn(InnerDataModel, 'findById')
    const testError = new Error('Test error')
    mockedInnerDataFind.mockImplementationOnce(
      // @ts-expect-error
      mockMongooseFindQuery(() => {
        throw testError
      })
    )

    let error: RepoReadError
    try {
      await InnerDataRepo.getById(innerDataObject._id)
    } catch (err) {
      error = err
    }

    expect(error instanceof RepoReadError)
    expect(error.message).toBe(testError.message)
  })

  test('GetAll succeeds', async () => {
    const foundTestData = await TestDataRepo.getAll()

    expect(foundTestData.length).toEqual(2)
    expect(foundTestData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          baseData: testDataObject1.baseData
        })
      ])
    )
    expect(foundTestData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          baseData: testDataObject2.baseData
        })
      ])
    )
  })

  test('GetAll bubbles up errors from database find', async () => {
    const mockedInnerDataFind = jest.spyOn(InnerDataModel, 'find')
    const testError = new Error('Test error')
    mockedInnerDataFind.mockImplementationOnce(
      // @ts-expect-error
      mockMongooseFindQuery(() => {
        throw testError
      })
    )

    let error: RepoReadError
    try {
      await InnerDataRepo.getAll()
    } catch (err) {
      error = err
    }

    expect(error instanceof RepoReadError)
    expect(error.message).toBe(testError.message)
  })

  test('GetOneByPartial succeeds', async () => {
    const foundTestData = await TestDataRepo.getOneByPartial(testTemplate)

    expect(foundTestData.baseData).toEqual(testDataObject1.baseData)
    expect(foundTestData.arrayData).toEqual(testDataObject1.arrayData)
    expect(foundTestData.innerData).toEqual(innerDataObject._id)
  })

  test('GetOneByPartial bubbles up errors from database find', async () => {
    const mockedInnerDataFind = jest.spyOn(InnerDataModel, 'findOne')
    const testError = new Error('Test error')
    mockedInnerDataFind.mockImplementationOnce(
      // @ts-expect-error
      mockMongooseFindQuery(() => {
        throw testError
      })
    )

    let error: RepoReadError
    try {
      await InnerDataRepo.getOneByPartial(innerTemplate)
    } catch (err) {
      error = err
    }

    expect(error instanceof RepoReadError)
    expect(error.message).toBe(testError.message)
  })
})

/*
describe('Test update factory', async () => {
  // @todo: insert test objects
  beforeAll(async () => {
    jest.resetAllMocks()
    await resetTestData()
  })

  beforeEach(async () => {
    await resetTestData()
  })

  test('UpdateById succeeds', async () => {

  })

  test('UpdateById bubbles up errors from database', async () => {
    
  })
})

describe('Test delete factory', async () => {
  // @todo: insert test objects
  beforeAll(async () => {
    jest.resetAllMocks()
    await resetTestData()
  })

  beforeEach(async () => {
    await resetTestData()
  })

  test('DeleteById succeeds', async () => {

  })

  test('DeleteById bubbles up errors from database', async () => {
    
  })
})
*/

import { Document, model, Schema, Types } from 'mongoose'

import * as Repository from '../../models/RepositoryFactory'

// Fake schema/model for testing
// Nested object
export interface InnerData {
  _id: Types.ObjectId
  data: string
}
export type InnerDataDocument = InnerData & Document
const innerDataSchema = new Schema({
  data: {
    type: String,
    default: ''
  }
})
const InnerDataCollection = 'InnerData'
export const InnerDataModel = model<InnerDataDocument>(
  InnerDataCollection,
  innerDataSchema
)
// Base test data object
export interface TestData {
  _id: Types.ObjectId
  baseData: string
  innerData: Types.ObjectId | InnerData
  arrayData: string[]
}
export type TestDataDocument = TestData & Document
const testDataSchema = new Schema({
  baseData: {
    type: String,
    default: ''
  },
  innerData: {
    type: Schema.Types.ObjectId,
    ref: 'InnerData'
  },
  arrayData: [String]
})
const TestDataCollection = 'TestData'
export const TestDataModel = model<TestDataDocument>(
  TestDataCollection,
  testDataSchema
)

// Actual functions to test
export const InnerDataRepo = Repository.repositoryFactory<InnerData>(
  InnerDataModel
)
export const TestDataRepo = Repository.repositoryFactory<TestData>(
  TestDataModel
)

// Test teardown
export async function resetTestData(): Promise<void> {
  await InnerDataModel.deleteMany({})
  await TestDataModel.deleteMany({})
}

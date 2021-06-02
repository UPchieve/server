/* eslint @typescript-eslint/no-use-before-define: 0 */

import { Document, model, Schema, Types } from 'mongoose'
import _ from 'lodash'
import validator from 'validator'
import SessionModel, { Session } from './Session'
import { RepoCreateError, RepoReadError } from './Errors'

export const ASSISTMENTS = 'assistments'

export interface AssistmentsData {
  _id: Types.ObjectId
  problemId: number
  assignmentId: string // UUID
  studentId: string // UUID
  session: Types.ObjectId | Session
}

type AssistmentsDataDocument = AssistmentsData & Document

const assistmentsDataSchema = new Schema({
  problemId: {
    type: Number,
    required: true,
    validate: {
      validator: Number.isInteger,
      message: props => `${props.value} is not an integer`
    }
  },
  assignmentId: {
    type: String,
    required: true,
    validate: {
      validator: (v: string) => {
        return validator.isUUID(v, 'v4')
      },
      message: props => `${props.value} is not a valid UUIDv4`
    }
  },
  studentId: {
    type: String,
    required: true,
    validate: {
      validator: (v: string) => {
        return validator.isUUID(v, 'v4')
      },
      message: props => `${props.value} is not a valid UUIDv4`
    }
  },
  session: {
    type: Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
    validate: {
      validator: validSession,
      message: props => `${props.value} is not a valid session`
    }
  }
})

const AssistmentsDataCollection = 'AssistmentsData'

// @todo: figure out how to test without exposing the model
export const AssistmentsDataModel = model<AssistmentsDataDocument>(
  AssistmentsDataCollection,
  assistmentsDataSchema
)

// Utilities
async function validSession(
  sessionId: Types.ObjectId | string
): Promise<boolean> {
  const session = await SessionModel.findById(sessionId)
    .lean()
    .exec()
  if (_.isEmpty(session)) return false
  return true
}

// Create functions
export async function createBySession(
  problemId: number,
  assignmentId: string,
  studentId: string,
  session: Types.ObjectId | string
): Promise<AssistmentsData> {
  const ad = await getBySession(session)
  if (!_.isEmpty(ad))
    throw new RepoCreateError(
      `AssistmentsData document for session ${session} already exists`
    )
  if (!(await validSession(session)))
    throw new RepoCreateError(`Session ${session} does not exist`)

  let data: AssistmentsDataDocument
  try {
    data = (await AssistmentsDataModel.create({
      problemId,
      assignmentId,
      studentId,
      session
    })) as AssistmentsDataDocument
  } catch (err) {
    throw new RepoCreateError(err.message)
  }
  return data.toObject() as AssistmentsData
}

// Read functions
export async function getById(
  id: Types.ObjectId | string
): Promise<AssistmentsData> {
  let data: AssistmentsData
  try {
    data = (await AssistmentsDataModel.findById(id)
      .lean()
      .exec()) as AssistmentsData
  } catch (err) {
    throw new RepoReadError(err.message)
  }
  if (!data) return {} as AssistmentsData
  return data
}

export async function getAll(): Promise<AssistmentsData[]> {
  let data: AssistmentsData[]
  try {
    data = (await AssistmentsDataModel.find()
      .lean()
      .exec()) as AssistmentsData[]
  } catch (err) {
    throw new RepoReadError(err.message)
  }
  return data
}

export async function getBySession(
  sessionId: Types.ObjectId | string
): Promise<AssistmentsData> {
  let data: AssistmentsData
  try {
    data = (await AssistmentsDataModel.findOne({
      session: sessionId
    })
      .lean()
      .exec()) as AssistmentsData
  } catch (err) {
    throw new RepoReadError(err.message)
  }
  // do not return null
  if (!data) return {} as AssistmentsData
  return data
}

// Update functions

// Delete functions

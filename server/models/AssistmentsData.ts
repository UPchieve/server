/* eslint @typescript-eslint/no-use-before-define: 0 */

import { Document, model, Schema, Types } from 'mongoose'
import validator from 'validator'
import SessionModel, { Session } from './Session'
import { RepoCreateError, RepoReadError, RepoUpdateError } from './Errors'

export const ASSISTMENTS = 'assistments'

export interface AssistmentsData {
  _id: Types.ObjectId
  problemId: number
  assignmentId: string // UUID
  studentId: string // UUID
  session: Types.ObjectId | Session
  sent: boolean
  sentAt?: Date
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
        return validator.isUUID(v, 4)
      },
      message: props => `${props.value} is not a valid UUIDv4`
    }
  },
  studentId: {
    type: String,
    required: true,
    validate: {
      validator: (v: string) => {
        return validator.isUUID(v, 4)
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
  },
  sent: {
    type: Boolean,
    required: true,
    default: false
  },
  sentAt: {
    type: Date
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
  if (!session) return false
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
  if (ad)
    throw new RepoCreateError(
      `AssistmentsData document for session ${session} already exists`
    )
  if (!(await validSession(session)))
    throw new RepoCreateError(`Session ${session} does not exist`)

  try {
    const data = (await AssistmentsDataModel.create({
      problemId,
      assignmentId,
      studentId,
      session
    })) as AssistmentsDataDocument
    return data.toObject() as AssistmentsData
  } catch (err) {
    throw new RepoCreateError(err.message)
  }
}

// Read functions
export async function getByObjectId(
  id: Types.ObjectId | string
): Promise<AssistmentsData> {
  try {
    return (await AssistmentsDataModel.findById(id)
      .lean()
      .exec()) as AssistmentsData
  } catch (err) {
    throw new RepoReadError(err.message)
  }
}

export async function getAll(): Promise<AssistmentsData[]> {
  try {
    return (await AssistmentsDataModel.find()
      .lean()
      .exec()) as AssistmentsData[]
  } catch (err) {
    throw new RepoReadError(err.message)
  }
}

export async function getBySession(
  sessionId: Types.ObjectId | string
): Promise<AssistmentsData> {
  try {
    return (await AssistmentsDataModel.findOne({
      session: sessionId
    })
      .lean()
      .exec()) as AssistmentsData
  } catch (err) {
    throw new RepoReadError(err.message)
  }
}

export function getAssistmentsDataWithPipeline(pipeline: any[]) {
  return (AssistmentsDataModel.aggregate(pipeline) as unknown) as Promise<any[]>
}

// Update functions
export async function updateSentAtById(
  id: Types.ObjectId | string,
  sentAt: Date
): Promise<void> {
  try {
    const result = await AssistmentsDataModel.updateOne(
      {
        _id: id
      },
      {
        sent: true,
        sentAt: sentAt
      }
    )
    if (!result.ok) throw new Error('Update query did not return "ok"')
  } catch (err) {
    throw new RepoUpdateError(err.message)
  }
}

// Delete functions

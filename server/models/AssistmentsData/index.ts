import { Document, model, Schema, Types, ValidatorProps } from 'mongoose'
import validator from 'validator'
import SessionModel, { Session } from '../Session'

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

export type AssistmentsDataDocument = AssistmentsData & Document

const assistmentsDataSchema = new Schema({
  problemId: {
    type: Number,
    required: true,
    validate: {
      validator: Number.isInteger,
      message: (props: ValidatorProps) => `${props.value} is not an integer`,
    },
  },
  assignmentId: {
    type: String,
    required: true,
    validate: {
      validator: (v: string) => {
        return validator.isUUID(v, 4)
      },
      message: (props: ValidatorProps) =>
        `${props.value} is not a valid UUIDv4`,
    },
  },
  studentId: {
    type: String,
    required: true,
    validate: {
      validator: (v: string) => {
        return validator.isUUID(v, 4)
      },
      message: (props: ValidatorProps) =>
        `${props.value} is not a valid UUIDv4`,
    },
  },
  session: {
    type: Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
    validate: {
      validator: validSession,
      message: (props: ValidatorProps) =>
        `${props.value} is not a valid session`,
    },
  },
  sent: {
    type: Boolean,
    required: true,
    default: false,
  },
  sentAt: {
    type: Date,
  },
})

const AssistmentsDataCollection = 'AssistmentsData'

export const AssistmentsDataModel = model<AssistmentsDataDocument>(
  AssistmentsDataCollection,
  assistmentsDataSchema
)

// Utilities
export async function validSession(
  sessionId: Types.ObjectId
): Promise<boolean> {
  const session = await SessionModel.findById(sessionId)
    .lean()
    .exec()
  if (!session) return false
  return true
}

export default AssistmentsDataModel

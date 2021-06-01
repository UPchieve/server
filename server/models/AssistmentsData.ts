import { Document, model, Schema, Types } from 'mongoose'
import _ from 'lodash'
import SessionModel, { Session } from './Session'
import StudentModel from './Student'
import {
  RepoCreateError,
  RepoReadError,
} from './Errors'

export const ASSISTMENTS = 'assistments'

export interface AssistmentsData {
  _id: Types.ObjectId,
  problemId: string,
  assignmentId: string,
  session: Types.ObjectId | Session
}

type AssistmentsDataDocument = AssistmentsData & Document

const assistmentsDataSchema = new Schema({
  problemId: {
    type: String,
    default: ''
  },
  assignmentId: {
    type: String,
    default: ''
  },
  session: {
    type: Schema.Types.ObjectId,
    ref: 'Session'
    // @todo: validate the session exists and student is assistments student
  }
})

const AssistmentsDataCollection = 'AssistmentsData'

export const AssistmentsDataModel = model<AssistmentsDataDocument>(
  AssistmentsDataCollection,
  assistmentsDataSchema
)

// Utilities
async function validSession(sessionId: Types.ObjectId): Promise<boolean> {
  const session = await SessionModel.findById(sessionId).lean().exec()
  const student = await StudentModel.findById(session.student).lean().exec()
  if (student.studentPartnerOrg !== ASSISTMENTS) return false
  return true
}

// Create functions
export async function createBySession(
  problemId: string,
  assignmentId: string,
  sessionId: Types.ObjectId
): Promise<AssistmentsData> {
  const ad = await getBySession(sessionId)
  if (!_.isEmpty(ad))
    throw new RepoCreateError(`AssistmentsData document for session ${sessionId} already exists`)
  if (!await validSession(sessionId))
    throw new RepoCreateError(`Session ${sessionId} is not for an ASSISTments student`)

  const adModel = new AssistmentsDataModel({
    problemId,
    assignmentId,
    session: sessionId
  })
  let createdDoc: AssistmentsDataDocument
  try {
    createdDoc = await adModel.save() as AssistmentsDataDocument
  } catch (err) {
    throw new RepoCreateError(err.message)
  }
  return createdDoc.toObject() as AssistmentsData
}

// Read functions
export async function getById(id: Types.ObjectId | string): Promise<AssistmentsData> {
  let doc: AssistmentsData
  try {
    doc = await AssistmentsDataModel.findById(id).lean().exec() as AssistmentsData
  } catch (err) {
    throw new RepoReadError(err.message)
  }
  if (!doc) return {} as AssistmentsData
  return doc
}

export async function getAll(): Promise<AssistmentsData[]> {
  let docs: AssistmentsData[]
  try {
    docs = await AssistmentsDataModel.find().lean().exec() as AssistmentsData[]
  } catch (err) {
    throw new RepoReadError(err.message)
  }
  return docs
}

export async function getBySession(
  sessionId: Types.ObjectId | string
): Promise<AssistmentsData> {
  let data: AssistmentsData
  try {
    data = await AssistmentsDataModel.findOne({
      session: sessionId
    }).lean().exec() as AssistmentsData
  } catch (err) {
    throw new RepoReadError(err.message)
  }
  // do not return null
  if (!data) return {} as AssistmentsData
  return data
}

// Update functions

// Delete functions
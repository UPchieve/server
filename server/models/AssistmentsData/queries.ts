import { Types } from 'mongoose'
import {
  AssistmentsDataModel,
  validSession,
  AssistmentsData,
  AssistmentsDataDocument,
} from './index'
import { RepoCreateError, RepoReadError, RepoUpdateError } from '../Errors'

// Create functions
export async function createAssistmentsDataBySession(
  problemId: number,
  assignmentId: string,
  studentId: string,
  session: Types.ObjectId
): Promise<AssistmentsData> {
  const ad = await getAssistmentsDataBySession(session)
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
      session,
    })) as AssistmentsDataDocument
    return data.toObject() as AssistmentsData
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

// Read functions
export async function getAssistmentsDataByObjectId(
  id: Types.ObjectId
): Promise<AssistmentsData | undefined> {
  try {
    const ad = await AssistmentsDataModel.findById(id)
      .lean()
      .exec()
    if (ad) return ad as AssistmentsData
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function getAllAssistmentsData(): Promise<AssistmentsData[]> {
  try {
    return (await AssistmentsDataModel.find()
      .lean()
      .exec()) as AssistmentsData[]
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getAssistmentsDataBySession(
  sessionId: Types.ObjectId
): Promise<AssistmentsData | undefined> {
  try {
    const ad = await AssistmentsDataModel.findOne({
      session: sessionId,
    })
      .lean()
      .exec()
    if (ad) return ad as AssistmentsData
  } catch (err) {
    throw new RepoReadError(err)
  }
}

// TODO: this should not be used - make a specific getter if you need a pipeline
export function getAssistmentsDataWithPipeline(
  pipeline: any[]
): Promise<any[]> {
  return (AssistmentsDataModel.aggregate(pipeline) as unknown) as Promise<any[]>
}

// Update functions
export async function updateAssistmentsDataSentAtById(
  id: Types.ObjectId,
  sentAt: Date
): Promise<void> {
  try {
    const result = await AssistmentsDataModel.updateOne(
      {
        _id: id,
      },
      {
        sent: true,
        sentAt: sentAt,
      }
    )
    if (!result.acknowledged)
      throw new RepoUpdateError('Update query was not acknowledged')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

// pg wrappers
import client from '../../pg'
import * as pgQueries from './pg.queries'
import { makeRequired, Ulid, Uuid, getDbUlid } from '../pgUtils'

type IAssistmentsData = {
  id: Ulid
  problemId: number
  assignmentId: Uuid // UUID
  studentId: Uuid // UUID
  sessionId: Ulid
  sent: boolean
}

export async function IgetAssistmentsDataBySession(
  sessionId: Ulid
): Promise<IAssistmentsData | undefined> {
  try {
    const result = await pgQueries.getAssistmentsDataBySession.run(
      { sessionId },
      client
    )
    if (result.length) return makeRequired(result[0])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function updateAssistmentsDataSentById(
  assistmentsDataId: Ulid
): Promise<void> {
  try {
    const result = await pgQueries.updateAssistmentsDataSentById.run(
      { assistmentsDataId },
      client
    )
    if (result.length && result[0].id) return
    throw new RepoUpdateError('Update query did not return id')
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function IcreateAssistmentsDataBySessionId(
  problemId: number,
  assignmentId: Ulid,
  studentId: Ulid,
  sessionId: Ulid
): Promise<IAssistmentsData> {
  try {
    const result = await pgQueries.createAssistmentsDataBySessionId.run(
      {
        id: getDbUlid(),
        problemId,
        assignmentId,
        studentId,
        sessionId,
      },
      client
    )
    if (result.length) return makeRequired(result[0])
    throw new RepoCreateError('Insert did not return new row')
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

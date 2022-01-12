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

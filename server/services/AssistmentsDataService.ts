import { Types } from 'mongoose'
import { createBySession, AssistmentsData } from '../models/AssistmentsData'

export function create(
  problemId: number,
  assignmentId: string,
  studentId: string,
  session: Types.ObjectId
): Promise<AssistmentsData> {
  return createBySession(problemId, assignmentId, studentId, session)
}

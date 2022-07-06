import { Ulid } from '../models/pgUtils'
import { getSessionById } from '../models/Session'
import {
  getPresessionSurveyResponse,
  StudentPresessionSurveyResponse,
} from '../models/Survey'
import { getTotalSessionsByUserId } from '../models/User'

type VolunteerContextResponse = {
  totalStudentSessions: number
  responses: StudentPresessionSurveyResponse[]
}

export async function getContextSharingForVolunteer(
  sessionId: Ulid
): Promise<VolunteerContextResponse> {
  const responses = await getPresessionSurveyResponse(sessionId)
  const session = await getSessionById(sessionId)
  const totalStudentSessions = await getTotalSessionsByUserId(session.studentId)
  return {
    totalStudentSessions,
    responses,
  }
}

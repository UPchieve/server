import { Types } from 'mongoose'
import { Session } from '../models/Session'
import { MATH_SUBJECTS, GRADES } from '../constants'
import { getSessionById } from '../models/Session/queries'
import { getStudentById } from '../models/Student/queries'
import { getSchool } from '../services/SchoolService'
import { Student } from '../models/Student'
import { School } from '../models/School'
import { getIdFromModelReference } from '../utils/model-reference'

export interface GatesQualifiedData {
  session: Session
  student: Student
  school: School
}

/**
 * A Gates-qualified session is defined as a session with the following:
 *
 * - Not a school partner student
 * - Not a nonprofit partner student
 * - Brand new student, must be first session on the platform
 * - In 9th grade or 10th grade
 * - Not reported by time of ending
 * - Math tutoring session
 *
 */
export function isGatesQualifiedSession(data: GatesQualifiedData) {
  const { session, student, school } = data

  return (
    !school.isPartner &&
    !student.studentPartnerOrg &&
    student.pastSessions.length === 1 &&
    (student.currentGrade === GRADES.NINTH ||
      student.currentGrade === GRADES.TENTH) &&
    !session.isReported &&
    // must typecast values to string since typescript treats enum RHS values weirdly
    Object.values<string>(MATH_SUBJECTS).includes(session.subTopic)
  )
}

export async function prepareForGatesQualificationCheck(
  sessionId: Types.ObjectId
): Promise<GatesQualifiedData> {
  const session = await getSessionById(sessionId)
  const student = await getStudentById(getIdFromModelReference(session.student))
  if (!student) throw new Error('Gates student not found')
  const school = await getSchool(
    getIdFromModelReference(student.approvedHighschool)
  )
  if (!school) throw new Error('Gates school not found')
  return {
    session,
    student,
    school,
  }
}

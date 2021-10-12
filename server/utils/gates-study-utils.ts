import { Session } from '../models/Session'
import { MATH_SUBJECTS, GRADES } from '../constants'
import { getSessionById } from '../services/SessionService'
import { getUser } from '../services/UserService'
import { getSchool } from '../services/SchoolService'
import { Student } from '../models/Student'
import { School } from '../models/School'

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
    Object.values(MATH_SUBJECTS).includes(session.subTopic)
  )
}

export async function prepareForGatesQualificationCheck(
  sessionId: string
): Promise<GatesQualifiedData> {
  const session = await getSessionById(sessionId)
  const student = await getUser({ _id: session.student })
  const school = await getSchool(student.approvedHighschool)

  return {
    session,
    student,
    school
  }
}

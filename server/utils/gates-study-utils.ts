import { GRADES } from '../constants'
import { getGatesStudentById } from '../models/Student/queries'
import { getSchool } from '../services/SchoolService'
import * as StudentRepo from '../models/Student'
import { AdminSchool } from '../models/School'
import { Ulid } from '../models/pgUtils'

export interface GatesQualifiedData {
  student: StudentRepo.GatesStudent
  school: AdminSchool
}

/**
 * A Gates-qualified student is defined as a student with the following:
 *
 * - Not a school partner student
 * - Not a nonprofit partner student
 * - In 9th grade or 10th grade
 *
 */
export function isGatesQualifiedStudent(data: GatesQualifiedData) {
  const { student, school } = data
  return (
    !school.isPartner &&
    !student.studentPartnerOrg &&
    (student.currentGrade === GRADES.NINTH ||
      student.currentGrade === GRADES.TENTH)
  )
}

export async function prepareForGatesQualificationCheck(
  userId: Ulid
): Promise<GatesQualifiedData> {
  const student = await getGatesStudentById(userId)
  if (!student) throw new Error('Gates student not found')
  const school = await getSchool(student.approvedHighschool)

  if (!school) throw new Error('Gates school not found')
  return {
    student,
    school,
  }
}

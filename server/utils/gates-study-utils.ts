import { Types } from 'mongoose'
import { GRADES } from '../constants'
import { getStudentById } from '../models/Student/queries'
import { getSchool } from '../services/SchoolService'
import { Student } from '../models/Student'
import { School } from '../models/School'
import { getIdFromModelReference } from '../utils/model-reference'

export interface GatesQualifiedData {
  student: Student
  school: School
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
  userId: Types.ObjectId
): Promise<GatesQualifiedData> {
  const student = await getStudentById(userId)
  if (!student) throw new Error('Gates student not found')
  const school = await getSchool(
    getIdFromModelReference(student.approvedHighschool)
  )
  if (!school) throw new Error('Gates school not found')
  return {
    student,
    school,
  }
}

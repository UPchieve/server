import { UserRole } from '../models/User'

export function isVolunteerUserType(userType: UserRole) {
  return userType === 'volunteer'
}

export function isStudentUserType(userType: UserRole) {
  return userType === 'student'
}

export function isTeacherUserType(userType: UserRole) {
  return userType === 'teacher'
}

export type UserRole =
  | 'volunteer'
  | 'student'
  | 'teacher'
  | 'admin'
  | 'ambassador'

/*
 * - Right now, most of the app experience is driven by whether a user is a student, volunteer, or teacher, and
 * these are what we serve to the client to use as the userType/activeRole.
 * - But technically users can have other roles, like admin and ambassador, which don't dictate the overall in-app
 * experience like the other 3 do. Furthermore, admins and ambassadors are also both volunteers.
 * - So you can think of PrimaryUserRole as referring to the "main user types"
 */
export type PrimaryUserRole = Exclude<UserRole, 'admin' | 'ambassador'>
export type SessionUserRole = 'student' | 'volunteer'

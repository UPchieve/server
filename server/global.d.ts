import { Student } from './models/Student'
import { Volunteer } from './models/Volunteer'

// declaring types here bypasses the typescript-eslint/no-unused-vars error
type StudentUser = Student
type VolunteerUser = Volunteer

declare global {
  namespace Express {
    interface Request {
      user?: StudentUser | VolunteerUser
    }
  }
}

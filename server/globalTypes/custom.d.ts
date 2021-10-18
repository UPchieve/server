import { Student } from './models/Student'
import { Volunteer } from './models/Volunteer'
import { Types } from 'mongoose'

declare namespace Express {
  interface Request {
    user?: Student | Volunteer
    ip: string
  }
  interface User {
    _id: Types.ObjectId
  }
}

import { Student } from './models/Student'
import { Volunteer } from './models/Volunteer'
import { Types } from 'mongoose'

declare global {
  namespace Express {
    export interface User extends Student, Volunteer {
      _id: Types.ObjectId
      isAdmin: boolean
    }
    export interface Request {
      ip: string
      // this is the signature we get after promisifying login
      // see app.ts line 166
      asyncLogin: (arg1: User, arg2?: any) => Promise<unknown>
    }
  }
}
